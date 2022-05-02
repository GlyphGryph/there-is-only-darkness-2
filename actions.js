const mongoose = require('mongoose');

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
	lookAt: async function(player, targetName){
		await player.populate('room');
		let found = await player.room.findIn(targetName);
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