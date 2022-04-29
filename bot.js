const {Client, Intents} = require('discord.js');
const config = require('./config.json');
const Game = require('./game.js');
const forgeListener = require('./forgeListener.js');
const playerListener = require('./playerListener.js');
const mongoose = require('mongoose');

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
	await client.channels.fetch(config.generalChannelId).then(channel => {
		global.game.generalChannel = channel;
		channel.send('Connected!');
		console.log('Connected to Discord server.');
	});
	await client.channels.fetch(config.forgeChannelId).then(channel => {
		global.game.forgeChannel = channel;
	});
	await global.game.load();
});

//Connect to Database and then login to client
const dbURI='mongodb://127.0.0.1:27017/there_is_only_darkness'
mongoose.connect(dbURI).then((result) =>{
	console.log('Connected to MongoDB');
	client.login(config.token);
}).catch((err) => console.log(err));

client.on('messageCreate', message => {
	console.log('Received client message: '+message.content+' on '+message.channel.id);
	forgeListener(message);
	playerListener(message);
});