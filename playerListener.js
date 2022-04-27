const { Permissions } = require('discord.js');

function playerListener(message, game){
	// Is this message on a player channel by the channel's associated player?
	if(!game.playersByChannelId.has(message.channel.id)){
		return false;
	}
	let player = game.playersByChannelId.get(message.channel.id);
	if(message.author.id != player.discordId){
		return false;
	}
	
	// If so, execute as a command
	let cmd = message.content.trim();
	let args=cmd.split(' ');
	// Simple, atomic commands
	if('look'==cmd){
		message.channel.send('There is only darkness.');
	}else{
		message.channel.send('Command "'+cmd+'" not recognized');
	}
	
	return true;
}


module.exports = playerListener;