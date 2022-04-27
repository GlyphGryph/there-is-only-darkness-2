const { Permissions } = require('discord.js');
const mongoose = require('mongoose');
const World = require('./world.js');
const Player = require('./player.js');

function forgeListener(message, game){
	if(message.channel.id!=game.forgeChannel.id){
		return false;
	}
	console.log('Received message from forge channel...');
	if (message.content.substring(0, 1) == '!'){
		let cmd = message.content.substring(1).trim();
		let args=cmd.split(' ');
		// Simple, atomic commands
		if('ping'==cmd){
			message.channel.send('I am alive.');
		}else if('create world'==cmd){
			World.create(game);
		}else if('list worlds'==cmd){
			if(game.worlds.length > 0){
				let worldList = game.worlds.map(world => {
					return world.name;
				});
				message.reply('Worlds ('+game.worlds.length+'): '+worldList.join(', '));
			} else {
				message.reply('No worlds exist.');
			}
		//Complex Commands
		}else if('join'==args[0]){
			let worldName = args.slice(1).join(' ');
			let world = game.worlds.find(world => {return world.name == worldName});
			if('undefined' == typeof world){
				message.reply('A world by the name '+worldName+' does not exist');
			}else if(world.has_user(message.author.id)){
				message.reply('You are already a part of that world.')
			}else{ // World Found!
				Player.create(game, world, message.author);
			}
		}else{
			message.reply('Command "'+cmd+'" not recognized');
		}
	}
	
	return true;
}


module.exports = forgeListener;