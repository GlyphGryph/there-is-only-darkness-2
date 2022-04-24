const {Client, Intents} = require('discord.js');
var logger = require('winston');
var config = require('./config.json');
var World = require('./world.js');
var Player = require('./player.js');
var forgeListener = require('./forgeListener.js');

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
	client.guilds.fetch('967231000096682035').then(guild => {
		gameState.guild = guild;
	});
	client.channels.fetch('967231000096682038').then(channel => {
		channel.send('Connected!');
		logger.info('Connected!');
	});
});
client.login(config.token);


var gameState = {
	client: client,
	newWorldId: 0,
	worlds: []
}

client.on('messageCreate', message => {
	logger.info('Received client message: '+message.content);
	forgeListener(message, gameState);
});