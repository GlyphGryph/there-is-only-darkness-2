const { Permissions } = require('discord.js');
const Player = require('./player.js');
const Actions = require('./actions.js');

const playerListener = async function(message){
	// Is this message on a player channel by the channel's associated player?
	let player = await Player.findOne({channelId: message.channel.id})
	if(null == player || message.author.id != player.discordId){
		return false;
	}
	
	// If so, execute as a command
	let command = message.content.trim();
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
	// Simple, atomic commands
	}else if('look'==base){
		if(options){
			Actions.lookAt(player, options);
		}else{
			player.look();
		}
	// The debug command, for whatever I'm currently testing
	}else if('debug'==command){
		Actions.debug(player);
	// Complex, multi-part commands
	}else if('get'==base){
		if(options){
			Actions.get(player, options);
		}else{
			message.channel.send('Get what?');
		}
	}else if('go'==base){
		let room = await player.getRoom();
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