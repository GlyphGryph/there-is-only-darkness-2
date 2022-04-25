const {Client, Intents} = require('discord.js');
var logger = require('winston');
var config = require('./config.json');
var World = require('./world.js');
var Player = require('./player.js');
var PlayerChannel = require('./playerChannel.js');
var forgeListener = require('./forgeListener.js');
var playerListener = require('./playerListener.js');

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
	client.guilds.fetch(config.serverId).then(guild => {
		gameState.guild = guild;
	});
	client.channels.fetch(config.generalChannelId).then(channel => {
		channel.send('Connected!');
		logger.info('Connected!');
	});
});
client.login(config.token);


var gameState = {
	client: client,
	newWorldId: 0,
	worlds: [],
	playerChannelsById: new Map(),
	config: config
}

client.on('messageCreate', message => {
	logger.info('Received client message: '+message.content+' on '+message.channel.id);
	forgeListener(message, gameState);
	playerListener(message, gameState);
});