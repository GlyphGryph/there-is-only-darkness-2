const { Permissions } = require('discord.js');
const Player = require('./models/player.js');
const Actions = require('./actions.js');

const playerListener = async function(message){
	// Is this message on a player channel by the channel's associated player?
	let player = await Player.query().findOne({channelId: message.channel.id})
	if(!player || message.author.id != player.discordId){
		return false;
	}
	
	// If so, execute as a command
	let command = message.content.trim().toLowerCase();
	let args=command.split(' ');
	let base = args[0];
	let options = args.slice(1).join(" ");
	// Speechify and actionify
	if (message.content.substring(0, 1) == '"'){
		let txt = message.content.substring(1).trim();
		player.say(txt);
	}else if(message.content.substring(0, 1) == '-'){
		let txt = message.content.substring(1);
		player.emote(txt);
	// The debug command, for whatever I'm currently testing
	}else if('debug'==command){
		Actions.debug(player);
	// Simple, atomic commands
	}else if('inv'==base || 'inventory'==base){
		Actions.inventory(player);
	}else if('items'==base){
		Actions.items(player);
	}else if('look'==base){
		if(options){
			Actions.lookAt(player, options);
		}else{
			Actions.look(player);
		}
	// Complex, multi-part commands
	}else if('build'==base){
		Actions.build(player, options);	
	}else if('consider'==base){
		let category = args[1];
		let target = args.slice(2).join(" ");
		Actions.consider(player, category, target);	
	}else if('drop'==base){
		if(options){
			Actions.drop(player, options);
		}else{
			message.channel.send('Drop what?');
		}
	}else if('get'==base){
		if(options){
			Actions.get(player, options);
		}else{
			message.channel.send('Get what?');
		}
	}else if('go'==base){
		let room = await player.$query('room');
		chosenExit = await room.getExit(options);
		if(!!chosenExit){
			await player.moveTo(chosenExit.to, 'move', chosenExit.name);
			player.look();
		} else {
			message.channel.send(options+' is not a valid exit.');
		}
	}else{
		message.channel.send('Command "'+command+'" not recognized');
	}
	
	return true;
}


module.exports = playerListener;