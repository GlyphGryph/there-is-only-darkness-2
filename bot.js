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
	constructor(gameState){
		this.id = gameState.newWorldId;
		this.name = 'World '+gameState.newWorldId;
		gameState.newWorldId++;
		gameState.worlds.push(this);
	}
}

var gameState = {
	newWorldId: 0,
	worlds: []
}

logger.info('Waiting...');
client.on('messageCreate', message => {
	//if('formless-void'==channelId){
	//	
	//}
	logger.info('Received client message');

	if (message.content.substring(0, 1) == '!'){
		var cmd = message.content.substring(1).trim();
		// Simple, atomic commands
		switch(cmd) {
			// !ping
			case 'ping':
				message.channel.send('I am alive.');
				break;
			case 'create world':
				let world = new World(gameState);
				message.reply('Created new world: '+world.name);
				break;
			case 'list worlds':
				if(gameState.worlds.count > 0){
					let worldList = gameState.worlds.map(world => {
						return world.name;
					}).join(', ');
				} else {
					worldList = 'No worlds exist.';
				}
				message.reply('Worlds: '+worldList);
				break;
		}
		//Complex Commands
		//let args=cmd.split(' ');
		//switch(args[0]) {
		//	case 'join'
		//}
	}
});