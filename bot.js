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
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
client.once('ready', () => {
	logger.info('Connected');
	logger.info('Logged in as: ');
	logger.info(bot.username + ' - (' + bot.id + ')');
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

bot.on('message', function (user, userId, channelId, message, evt) {
	if('formless-void'==channelId){
		
	}
	if (message.substring(0, 1) == '!'){
		var cmd = message.substring(1).trim();
		// Simple, atomic commands
		switch(cmd) {
			// !ping
			case 'ping':
				bot.sendMessage({
					to: channelId,
					message: 'I am alive.'
				});
				break;
			case 'create world':
				let world = new World(gameState);
				bot.sendMessage({
					to: channelId,
					message: 'Created new world: '+world.name
				});
				break;
			case 'list worlds':
				if(gameState.worlds.count > 0){
					let worldList = gameState.worlds.map(world => {
						return world.name;
					}).join(', ');
				} else {
					worldList = 'No worlds exist.';
				}
				bot.sendMessage({
					to: channelId,
					message: 'Worlds: '+worldList
				});
				break;
		}
		//Complex Commands
		let args=cmd.split(' ')
			case 'join'
	}
});