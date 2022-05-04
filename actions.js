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
				channel.send("You don't see an item by that name here.");
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
	lookAt: async function(player, targetName){
		await player.populate('room');
		if('self' == targetName){
			found = {
				type: 'Player',
				value: player
			}
		}else{
			let found = await player.room.findIn(targetName);
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