const {Client, Intents} = require('discord.js');
const config = require('./config.json');
const Game = require('./game.js');
const forgeListener = require('./forgeListener.js');
const playerListener = require('./playerListener.js');

// Db/model stuff
const knex = require('knex')
const { Model } = require('objection')
const knexConfig = require('./knexfile')
const db = knex(knexConfig['development'])
Model.knex(db)


//Initialize Discord Bot
const client = new Client({
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	intents: ['DIRECT_MESSAGES', 'DIRECT_MESSAGE_REACTIONS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILDS']
});

client.once('ready', async () => {
	global.game = new Game(client);
	await client.guilds.fetch(config.serverId).then(guild => {
		global.game.guild = guild;
	});
	await client.channels.fetch(config.monitorChannelId).then(channel => {
		global.game.monitorChannel = channel;
		channel.send('Connected!');
		console.log('Connected to Discord server.');
	});
	await client.channels.fetch(config.forgeChannelId).then(channel => {
		global.game.forgeChannel = channel;
	});
	await global.game.load();
});

client.on('messageCreate', message => {
	if(message.author.id == client.user.id){ return false; }
	console.log('Received client message: '+message.content+' on '+message.channel.id);
	forgeListener(message);
	playerListener(message);
});

client.login(config.token);