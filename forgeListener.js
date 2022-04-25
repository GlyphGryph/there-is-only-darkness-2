const { Permissions } = require('discord.js');
var World = require('./world.js');
var Player = require('./player.js');

function forgeListener(message, gameState){
	if (message.content.substring(0, 1) == '!'){
		let cmd = message.content.substring(1).trim();
		let args=cmd.split(' ');
		// Simple, atomic commands
		if('ping'==cmd){
			message.channel.send('I am alive.');
		}else if('create world'==cmd){
			let world = new World(gameState);
			message.reply('Created new world: '+world.name);
		}else if('list worlds'==cmd){
			if(gameState.worlds.length > 0){
				let worldList = gameState.worlds.map(world => {
					return world.name;
				});
				message.reply('Worlds ('+gameState.worlds.length+'): '+worldList.join(', '));
			} else {
				message.reply('No worlds exist.');
			}
		//Complex Commands
		}else if('join'==args[0]){
			let worldName = args.slice(1).join(' ');
			let world = gameState.worlds.find(world => {return world.name == worldName});
			if('undefined' == typeof world){
				message.reply('A world by the name '+worldName+' does not exist');
			}else if(world.has_user(message.author.id)){
				message.reply('You are already a part of that world.')
			}else{ // World Found!
				let player = new Player(gameState, world, message.author, message.guild);
				message.reply(player.username+' joined world '+world.name)
			}
		}else{
			message.reply('Command "'+cmd+'" not recognized');
		}
	}
}


module.exports = forgeListener;