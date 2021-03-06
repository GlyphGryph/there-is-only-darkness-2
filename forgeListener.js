const { Permissions } = require('discord.js');
const World = require('./models/world.js');
const Player = require('./models/player.js');

const forgeListener = async function (message){
	if(message.channel.id!=global.game.forgeChannel.id){
		return false;
	}

	let cmd = message.content.trim();
	let args = cmd.split(' ');
	// Simple, atomic commands
	if('ping'==cmd){
		message.channel.send('I am alive.');
	}else if('create world'==cmd){
		message.channel.send('Creating world...');
		await World.create();
	}else if('list worlds'==cmd){
		await World.list();
	//Complex Commands
	}else if('destroy'==args[0]){
		let worldName = args.slice(1).join(' ');
		let world = await World.query().findOne({name: worldName});
		if(!world){
			message.reply('A world by the name '+worldName+' does not exist');
		}else{
			world.destroy();
		}
	}else if('join'==args[0]){
		let worldName = args.slice(1).join(' ');
		let world = await World.query().findOne({name: worldName});
		if(!world){
			message.reply('A world by the name '+worldName+' does not exist');
		}else if(await world.hasUser(message.author.id)){
			message.reply('You are already a part of that world.')
		}else{ // World Found!
			await Player.create(world, message.author);
		}
	}else{
		message.reply('Command "'+cmd+'" not recognized');
	}
	
	return true;
}


module.exports = forgeListener;