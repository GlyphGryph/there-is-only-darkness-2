const { Permissions } = require('discord.js');
var World = require('./world.js');
var Player = require('./player.js');

function playerListener(message, gameState){
	if(!gameState.playerChannelsById.has(message.channel.id)){
		return false;
	}

	let playerChannel = gameState.playerChannelsById.get(message.channel.id);
	console.log('Got here, at least!');
	console.log('Comparing '+message.author.id+' to '+playerChannel.player.discordId);
	if(message.author.id != playerChannel.player.discordId){
		return false;
	}
	
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