const Broadcast = require('./broadcast.js');
const Player = require('./models/player.js');
const Item = require('./models/item.js');
const ItemTemplateManager = require('./itemTemplateManager');
const Building = require('./models/building.js');
const buildingTemplates = require('./buildingTemplates');

const Actions = {
	build: async function(player, targetName){
		let room = await player.$relatedQuery('room');
		let scaffold = await room.findInScaffolds(targetName);
		if(scaffold){
			await scaffold.build(player);
			await Broadcast.shaped(player, await player.otherPlayers(),
				"You completed work on the new "+scaffold.getName()+".",
				player.name+" completed work on the new "+scaffold.getName()+"."
			);
			return true;
		} else {
			let template = await buildingTemplates.findByName(targetName);
			if(player.canPayCost({materials: template.cost})){
				scaffold = await Building.query().insertGraph({
					templateId: template.id,
					complete: false,
					roomId: player.roomId,
					inventory: {}
				}).returning('*');
				await Broadcast.shaped(player, await player.otherPlayers(),
					"You began work on a new "+await scaffold.getName()+".",
					player.name+" began work on a new "+scaffold.getName()+"."
				);
			}else{
				await Broadcast.personal(player, player.missingCostMessage({materials: template.cost}));
			}
		}
	},
	consider: async function(player, category, targetName){
		if(!category){
			Broadcast.personal(player, "You can consider various topics, like 'building', or details of those topics, like 'building Stick Man'");
			return true;
		}
		if("building" == category){
			if(targetName){
				let building = buildingTemplates.findByName(targetName);
				if(building){
					Broadcast.personal(player, building.name+'\n'+building.description);
				}else{
					Broadcast.personal(player, "You don't know anything about '"+category+"'.");
				}
			}else{
				Broadcast.personal(player, "You can build the following: "+buildingTemplates.names().join(", "));
			}
		}else{
			Broadcast.personal(player, "You don't know anything about '"+category+"'.");
			return false;
		}
		return true;
	},
	debug: async function(player){
		console.log('Adding item');
		let building = await Building.query().insertGraph({
			templateId: 'stickman',
			complete: false,
			roomId: player.roomId,
			inventory: {}
		}).returning('*');
		await Broadcast.personal(player, "You did it.");	
	},
	drop: async function(player, targetName){
		let item = await player.findInInventory(targetName);
		if(item){
			let room = await player.$relatedQuery('room');
			item.inventoryId = room.inventoryId;
			console.log(item);
			await item.$query().update();
			let otherPlayers = await player.otherPlayers();
			await Broadcast.shaped(player, otherPlayers,
				"You dropped the "+item.name+".",
				player.name+" dropped the "+item.name+"."
			);
		}else{
			await Broadcast.personal(player, "You aren't holding that.");
		}
	},
	get: async function(player, targetName){
		let room = await player.$relatedQuery('room');
		let item = await room.findInInventory(targetName);
		if(item){
			item.inventoryId = player.inventoryId;
			console.log(item);
			await item.$query().update();
			let otherPlayers = await player.otherPlayers();
			await Broadcast.shaped(player, otherPlayers,
				"You picked up the "+item.name+".",
				player.name+" picked up the "+item.name+"."
			);
		}else{
			await Broadcast.personal(player, "You don't see an item by that name here.");
		}
	},
	inventory: async function(player){
		let itemList = player.items.map(item=>{ return item.name}).join(', ');
		if(itemList){
			await Broadcast.personal(player, "Your items: "+itemList);
		}else{
			await Broadcast.personal(player, "You are carrying nothing.");
		}
	},
	items: async function(player){
		await player.populate('room');
		let room = player.room;
		let players = await Player.find({room: player.room});
		let itemList = "On floor: ";
		if(room.items && room.items.length > 0){
			let roomItems = room.items.map(item=>{ return item.name}).join(', ');
			itemList += roomItems;
		}else{
			itemList += "There's nothing here."
		}
		players.forEach(player =>{
			itemList += "\n\n"+player.name+": ";
			let playerItems = player.items.map(item=>{ return item.name}).join(', ');
			if(playerItems){
				itemList += playerItems;
			}else{
				itemList += "Carrying nothing."
			}
		});
		await Broadcast.personal(player, itemList);
	},
	look: async function(player){
		let room = await player.$relatedQuery('room');
		let otherPlayers = player.otherPlayers();
		//Description
		let textSoFar = room.description;
		textSoFar += '\n---\n';
		
		// Buildings
		let buildings = await room.getFunctionalBuildings();
		if(buildings.length > 0){
			textSoFar += 'Buildings: '+buildings.map(building =>{return building.getName()}).join(', ')+'\n';
		}
		
		// Scaffold 
		let scaffolds = await room.getScaffolds();
		if(scaffolds.length > 0){
			textSoFar += 'Scaffolds: '+scaffolds.map(scaffold =>{return scaffold.getName()}).join(', ')+'\n';
		}
		if(buildings.length > 0 && scaffolds.length > 0){
			textSoFar +='---\n';
		}
		
		// Exits
		let exitsDescription = await room.getExitsDescription();
		textSoFar += exitsDescription;

		//Players
		if(otherPlayers.length > 0){ 
			textSoFar += '\n---\nOther players at this location: ';
			let playerNames = otherPlayers.map(player=>{return player.name});
			textSoFar += playerNames.join(", ");
		}
		textSoFar += '\n---\n';
		//Items
		let items = await room.$relatedQuery('items');
		if(items && items.length > 0){
			textSoFar += 'Items: '+items.map(item =>{return item.name}).join(', ');
		}else{
			textSoFar += 'There are no items here.';
		}
		await Broadcast.personal(player, textSoFar);
	},
	lookAt: async function(player, targetName){
		let room = await player.$relatedQuery('room');
		let found;
		if('self' == targetName){
			found = {
				type: 'Player',
				value: player
			}
		}else{
			found = await room.findIn(targetName);
		}
		console.log(found);
		if('none' == found.type){
			let item = await player.findInInventory(targetName);
			if(item){
				found = {type: "Item", value: item};
			}
		}
		console.log(found);
		if('none' != found.type){
			await Broadcast.personal(player, await found.value.getDescription());
		}else{
			await Broadcast.personal(player, "You don't see anything by that name here.");
		}
	}
}

module.exports = Actions;