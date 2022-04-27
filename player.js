const { Permissions } = require('discord.js');
const mongoose = require('mongoose');
const World = require('./world.js');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
	world: {
		type: Schema.Types.ObjectId,
		ref: "World"
	},
	playername: String,
	username: String,
	discordId: String,
	playerId: Number,
	channelId: String
});

const PersistedPlayer = mongoose.model('Player', playerSchema);

class Player{
	game; persistedPlayer;
	world; channel;
	
	constructor(persistedPlayer, world, channel){
		this.game = world.game;
		this.persistedPlayer = persistedPlayer;
		this.world = world;
		this.channel = channel;
	}
	
	get displayId(){
		return this.persistedPlayer.displayId;
	}
	get id(){
		return this.persistedPlayer._id;
	}
	
	get discordId(){
		return this.persistedPlayer.discordId;
	}
	
	get username(){
		return this.persistedPlayer.username;
	}
	
	get playername(){
		return this.persistedPlayer.playername;
	}
	
	async save(){
		await this.persistedPlayer.save();
		return this;
	}
	
	has_user(discordId){
		let found = this.players.find(player => {
			return player.discordId == discordId;
		});
		return 'undefined' != typeof found
	}
}

Player.create = async function(game, world, user){
	console.log('Attempting to create player');
	var player = this;
	let discordId = user.id;
	let playerId = world.nextPlayerId;
	let playerName = "Player "+playerId;
	let channelName = world.name.toLowerCase().split(" ").join("-")+'-player-'+playerId;
	
	// Create Channel
	let channel = await game.guild.channels.create(channelName, {
		type: 'GUILD_TEXT',
		reason: 'Player joined world',
	})
	channel.setParent(world.categoryChannel.id);
	let everyoneRole = game.guild.roles.everyone;
	channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
	channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true });
		
	// Create persisted player
	let persistedPlayer = new PersistedPlayer({
		world: world.persistedWorld,
		playername: playerName,
		username: user.username,
		discordId: user.id,
		playerId: playerId,
		channelId: channel.id
	});

	// Create and hook up actual player object
	return persistedPlayer.save().then(async result => {
		let player = new Player(persistedPlayer, world, channel);
		world.players.push(player);
		// TODO: This is probably wrong
		world.persistedWorld.players.push(persistedPlayer._id);
		await world.save();
		world.players.push(player);
		game.playersByChannelId.set(channel.id, player);
		console.log('Player successfully joined world!');
		game.forgeChannel.send(player.username+' joined world '+world.name)
	}).catch(err => {
		console.log('Failed to create new player.');
		console.log(err);
		game.forgeChannel.send('Could not join world.');
		channel.delete();
	});
	
}

Player.load = async function(world){
	for(const persistedPlayerId of world.persistedWorld.players){
		console.log('attempting to load player '+persistedPlayerId);
		let persistedPlayer = await PersistedPlayer.findById(persistedPlayerId);
		let channel = await world.game.client.channels.fetch(persistedPlayer.channelId);
		let player = new Player(persistedPlayer, world, channel);
		console.log('Loaded player: '+player.username);
		world.players.push(player);
		world.game.playersByChannelId.set(channel.id, player);
	}
	return true;
}

module.exports = Player;