const Broadcast = require('./broadcast.js');
const Player = require('./models/player.js');
const Item = require('./models/item.js');
const itemTemplates = require('./itemTemplates');

const Actions = {
	build: async function(player, targetName){
		/*await player.populate('room');
		let room = player.room;
		let scaffold = await room.findInScaffolds(targetName);
		let template = await buildingTemplates.findByName(targetName);
		if(scaffold){
			await scaffold.build(player);
			return true;
		} else {
			await room.addScaffold(template.id);
			Broadcast.shaped(player.room, player,
				"You began work on a new "+template.name+".",
				player.name+" began work on a new "+template.name+"."
			);
			await scaffold.build(player);
		}*/
	},
	consider: async function(player, category, targetName){
		/*if(!category){
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
		return true;*/
	},
	debug: async function(player){
		console.log('Adding item');
		let template = itemTemplates.get('rock');
		let item = await Item.query().insert({
			name: template.name,
			description: template.description,
			inventoryId: player.inventoryId
		}).returning('*');
		/*await player.populate('room');
		
		await player.room.addScaffold('stickman');
		await player.room.addBuilding('rockpile');
		Broadcast.personal(player, 'Added buildings');*/
	},
	drop: async function(player, targetName){
		let item = await player.findInInventory(targetName);
		if(item){
			let room = await player.$relatedQuery('room');
			item.inventoryId = room.inventoryId;
			console.log(item);
			await item.$query().update();
			let otherPlayers = await Player.otherPlayers(player);
			Broadcast.shaped(player, otherPlayers,
				"You dropped the "+item.name+".",
				player.name+" dropped the "+item.name+"."
			);
		}else{
			Broadcast.personal(player, "You aren't holding that.");
		}
	},
	get: async function(player, targetName){
		let room = await player.$relatedQuery('room');
		let item = await room.findInInventory(targetName);
		if(item){
			item.inventoryId = player.inventoryId;
			console.log(item);
			await item.$query().update();
			let otherPlayers = await Player.otherPlayers(player);
			Broadcast.shaped(player, otherPlayers,
				"You picked up the "+item.name+".",
				player.name+" picked up the "+item.name+"."
			);
		}else{
			Broadcast.personal(player, "You don't see an item by that name here.");
		}
	},
	inventory: async function(player){
		let itemList = player.items.map(item=>{ return item.name}).join(', ');
		if(itemList){
			Broadcast.personal(player, "Your items: "+itemList);
		}else{
			Broadcast.personal(player, "You are carrying nothing.");
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
		Broadcast.personal(player, itemList);
	},
	look: async function(player){
		let room = await player.$relatedQuery('room');
		let otherPlayers = await Player.query().where({roomId: room.id}).whereNot({id: player.id});
		//Description
		let textSoFar = room.description;
		textSoFar += '\n---\n';
		// Buildings
		/*let buildings = room.$relatedQuery('buildings');
		if(room.buildings && room.buildings.length > 0){
			textSoFar += 'Buildings: '+room.buildings.map(building =>{return building.getName()}).join(', ')+'\n';
		}
		// Buildings
		if(room.scaffolds && room.scaffolds.length > 0){
			textSoFar += 'Buildings in progress: '+room.scaffolds.map(scaffold =>{
				let display = scaffold.getName();
				display += " ("+scaffold.progress+"/"+scaffold.getTemplate().workToComplete+")"
				return display;
			}).join(', ')+'\n';
		}
		if(room.scaffolds && room.scaffolds.length > 0 && room.buildings && room.buildings.length > 0){
			textSoFar +='---\n';
		}*/
		
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
		Broadcast.personal(player, textSoFar);
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
		if('none' == found.type){
			found = await player.findInInventory(targetName);
		}
		
		if('Player' == found.type){
			Broadcast.personal(player, await found.value.description());
		}else if('Item' == found.type){
			Broadcast.personal(player, await found.value.description());
		}else{
			Broadcast.personal(player, "You don't see anything by that name here.");
		}
	}
}

module.exports = Actions;