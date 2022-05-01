const { Permissions } = require('discord.js');
const Player = require('./player.js');

const playerListener = async function(message){
	// Is this message on a player channel by the channel's associated player?
	let player = await Player.findOne({channelId: message.channel.id})
	if(null == player || message.author.id != player.discordId){
		return false;
	}
	
	// If so, execute as a command
	let cmd = message.content.trim();
	let args=cmd.split(' ');
	// Speechify and actionify
	if (message.content.substring(0, 1) == '"'){
		let txt = message.content.substring(1).trim();
		player.say(txt);
	}else if(message.content.substring(0, 1) == '-'){
		let txt = message.content.substring(1);
		player.emote(txt);
	// Simple, atomic commands
	}else if('look'==cmd){
		player.look();
	}else if('go'==args[0]){
		let room = await player.getRoom();
		chosenExit = await room.getExit(args[1]);
		if(!!chosenExit){
			await player.moveTo(chosenExit.to, 'move', chosenExit.name);
			player.look();
		} else {
			message.channel.send(args[1]+' is not a valid exit.');
		}
	}else{
		message.channel.send('Command "'+cmd+'" not recognized');
	}
	
	return true;
}


module.exports = playerListener;