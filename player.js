const { Permissions } = require('discord.js');
const mongoose = require('mongoose');
const World = require('./world.js');
const PlayerChannel = require('./playerChannel.js');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
	world: {
		type: Schema.Types.ObjectId,
		ref: "World"
	},
	playername: String,
	discordUserId: String,
	displayId: Number,
	playerChannel: {
		type: Schema.Types.ObjectId,
		ref: "playerChannel"
	}
})

const PersistedPlayer = mongoose.model('Player', playerSchema);

class Player{
	game; persistedPlayer;
	world; playerChannel;
	
	constructor(game, persistedPlayer, world, playerChannel){
		this.game = game;
		this.persistedPlayer = persistedPlayer;
		this.world = world;
		this.categoryChannel = playerChannel;
	}
	
	get displayId(){
		this.persistedPlayer.displayId;
	}
	get id(){
		this.persistedPlayer._id;
	}
	
	has_user(discordId){
		let found = this.players.find(player => {
			return player.discordId == discordId;
		});
		return 'undefined' != typeof found
	}
}

Player.create = async function(gamestate, world, author){
	/*//playerChannel;
	var player = this;
	this.gameState = gameState;
	this.world = world;
	this.world.players.push(this);
	this.username = author.username;
	this.discordId = author.id;
	this.playerId = world.nextPlayerId;
	world.nextPlayerId++;
	let channelName = world.name.toLowerCase().split(" ").join("-")+'player-'+this.playerId;
	gameState.guild.channels.create(channelName, {
		type: 'GUILD_TEXT',
		reason: 'Player joined world',
	}).then(channel => {
		player.channel = channel;
		channel.setParent(world.categoryChannel.id);
		let everyoneRole = gameState.guild.roles.everyone;
		
		channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
		channel.permissionOverwrites.edit(author.id, { VIEW_CHANNEL: true });
		
		this.playerChannel = new PlayerChannel(player.gameState, channel, world, player);
	});*/
}

Player.load = async function(world){
		// TODO
}

module.exports = Player;