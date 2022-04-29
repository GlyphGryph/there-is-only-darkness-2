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

playerSchema.methods.destroy = async function(){
	await PersistedPlayer.deleteOne(this.persistedPlayer);
	this.channel.delete();
}

const Player = mongoose.model('Player', playerSchema);

Player.create = async function(world, user){
	console.log('Attempting to create player');
	let discordId = user.id;
	let playerId = world.getNextPlayerId();
	let playerName = "Player "+playerId;
	let channelName = world.name.toLowerCase().split(" ").join("-")+'-player-'+playerId;
	
	// Create Channel
	let channel = await global.game.guild.channels.create(channelName, {
		type: 'GUILD_TEXT',
		reason: 'Player joined world',
	})
	channel.setParent(world.categoryChannelId);
	let everyoneRole = global.game.guild.roles.everyone;
	channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
	channel.permissionOverwrites.edit(user.id, { VIEW_CHANNEL: true });
	console.log('Created new channel: '+channelName);

	// Create persisted player
	let player = new Player({
		world: world,
		playername: playerName,
		username: user.username,
		discordId: user.id,
		playerId: playerId,
		channelId: channel.id
	});

	// Create and hook up actual player object
	return player.save().then(async result => {
		world.players.push(player);
		await world.save();
		console.log('Player successfully joined world!');
		global.game.forgeChannel.send(player.username+' joined world '+world.name)
	}).catch(err => {
		console.log('Failed to create new player.');
		console.log(err);
		global.game.forgeChannel.send('Could not join world.');
		channel.delete();
	});
	
}

Player.load = async function(world){
	let players = await world.populate('players');
	console.log(world.persistedWorld);
	for(const persistedPlayerId of players){
		console.log('attempting to load player '+persistedPlayerId);
		let persistedPlayer = await PersistedPlayer.findById(persistedPlayerId);
		let channel = await global.game.client.channels.fetch(persistedPlayer.channelId).catch(async err => {
			let channelName = persistedWorld.name.split(' ').join('-');
			return await global.game.guild.channels.create(channelName, {
				type: 'GUILD_CATEGORY',
				reason: 'New world was created.'
			});
		});;
		if(channel.parentId != world.categoryChannel.id){
			channel.setParent(world.categoryChannel.id);
			let everyoneRole = global.game.guild.roles.everyone;
			channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
			channel.permissionOverwrites.edit(persistedPlayer.discordId, { VIEW_CHANNEL: true });
		}
		let player = new Player(persistedPlayer._id, world, channel);
		console.log('Loaded player: '+player.username);
		world.players.push(player);
		global.game.playersByChannelId.set(channel.id, player);
	}
	return true;
}

module.exports = Player;