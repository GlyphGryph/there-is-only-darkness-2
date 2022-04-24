const {Client, Intents} = require('discord.js');
var logger = require('winston');
var config = require('./config.json');

//Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
	colorize: true
});
logger.level = 'debug';

//Initialize Discord Bot
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
});
client.once('ready', () => {
	logger.info('Connected');
	client.channels.fetch('967231000096682038').then(channel => {
		channel.send('Connected!');
	});
});
client.login(config.token);

class World {
	gameState; id; name;
	users = [];

	constructor(gameState){
		this.gameState = gameState;
		this.id = gameState.newWorldId;
		this.name = 'World '+gameState.newWorldId;
		gameState.newWorldId++;
		gameState.worlds.push(this);
	}
	
	has_user(discordId){
		this.users.find(user => { user.discordId == discordId });
	}
}

class User {
	gamestate; world; username; discordId;

	constructor(gameState, world, author){
		this.gameState = gameState;
		this.world = world;
		this.world.users.push(this);
		this.username = author.username;
		this.discordId = author.id;
	}
}

var gameState = {
	newWorldId: 0,
	worlds: []
}

client.on('messageCreate', message => {
	//if('formless-void'==channelId){
	//	
	//}
	logger.info('Received client message');

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
				let user = new User(gameState, world, message.author);
				message.reply(user.username+' joined world '+world.name)
			}
		}else{
			message.reply('Command "'+cmd+'" not recognized');
		}
	}
});