const mongoose = require('mongoose');
const Broadcast = require('./broadcast.js');
const Player = require('./player.js');

const Actions = {
	debug: async function(player){
		console.log('Adding item');
		await player.populate('room');
		player.items.push({name: 'rock', description: 'A rocky rock'});
		player.save();
		player.getChannel().then(async channel => {
			channel.send('Added item');
		});
	},
	drop: async function(player, targetName){
		await player.populate('room');
		let found = await player.findInInventory(targetName);
		if('Item' == found.type){
			if(await player.removeItem(found.value)){
				await player.room.addItem(found.value);
			}
			Broadcast.shaped(player.room, player,
				"You dropped the "+found.value.name+".",
				player.name+" dropped the "+found.value.name+"."
			);
		}else{
			player.getChannel().then(async channel => {
				channel.send("You aren't holding that.");
			});
		}
	},
	get: async function(player, targetName){
		await player.populate('room');
		let found = await player.room.findIn(targetName);
		if('Item' == found.type){
			if(await player.room.removeItem(found.value)){
				await player.addItem(found.value);
			}
			Broadcast.shaped(player.room, player,
				"You picked up the "+found.value.name+".",
				player.name+" picked up the "+found.value.name+"."
			);
		}else{
			player.getChannel().then(async channel => {
				channel.send("You don't see an item by that name here.");
			});
		}
	},
	inventory: async function(player){
		let itemList = player.items.map(item=>{ return item.name}).join(', ');
		player.getChannel().then(async channel => {
			if(itemList){
				channel.send("Your items: "+itemList);
			}else{
				channel.send("You are carrying nothing.");
			}
		});
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
		player.getChannel().then(async channel => {
			channel.send(itemList);
		});
	},
	lookAt: async function(player, targetName){
		await player.populate('room');
		let found;
		if('self' == targetName){
			found = {
				type: 'Player',
				value: player
			}
		}else{
			found = await player.room.findIn(targetName);
		}
		if('none' == found.type){
			found = await player.findInInventory(targetName);
		}
		
		if('Player' == found.type){
			// TODO: This should eventually be different for yourself, those in your tribe, and strangers.
			player.getChannel().then(async channel => {
				console.log(found);
				console.log(found.value.description());
				channel.send(found.value.description());
			});
		}else if('Item' == found.type){
			player.getChannel().then(async channel => {
				channel.send(found.value.description);
			});
		}else{
			player.getChannel().then(async channel => {
				channel.send("You don't see anything by that name here.");
			});
		}
	}
}

module.exports = Actions;