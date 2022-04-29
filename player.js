const { Permissions } = require('discord.js');
const mongoose = require('mongoose');
const World = require('./world.js');
const Schema = mongoose.Schema;

const playerSchema = new Schema({
	world: {
		type: Schema.Types.ObjectId,
		ref: "World"
	},
	name: String,
	username: String,
	discordId: String,
	playerId: Number,
	channelId: String,
	room: {
		type: Schema.Types.ObjectId,
		ref: "Room",
		required: true
	},
});

playerSchema.methods.getChannel = async function(){
	let channel = await global.game.client.channels.fetch(this.channelId).catch(async err => {
		let channelName = this.name.split(' ').join('-');
		let channel = await global.game.guild.channels.create(channelName, {
			type: 'GUILD_CATEGORY',
			reason: 'New world was created.'
		});
		if(channel.parentId != world.categoryChannel.id){
			channel.setParent(world.categoryChannel.id);
			let everyoneRole = global.game.guild.roles.everyone;
			channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
			channel.permissionOverwrites.edit(this.discordId, { VIEW_CHANNEL: true });
		}
		this.channelId = channel.id;
		this.save();
		return channel;
	});
	return channel;
};

playerSchema.methods.destroy = async function(){
	await Player.deleteOne(this);
	this.getChannel().then(channel=>{ channel.delete()});
};

playerSchema.methods.look = async function(){
	await this.populate('room');
	let players = await Player.find({room: this.room._id, _id:{$ne: this._id}});
	this.getChannel().then(async channel => {
		let textSoFar = this.room.description;
		textSoFar += '\n---\n';
		let exitsDescription = await this.room.getExitsDescription();
		textSoFar += exitsDescription;
		textSoFar += '\n---\nOther players at this location: ';
		console.log(players);
		let playerNames = players.map(player=>{return player.name});
		console.log(playerNames);
		textSoFar += playerNames.join(", ");
		
		channel.send(textSoFar);
	});
}

playerSchema.methods.moveTo = async function(newRoom, method){
	this.room = newRoom;
	let player = this;
	this.getChannel().then(async channel => {
		channel.send("You "+method);
	});
	return await this.save();
}

playerSchema.methods.getRoom = async function(){
	await this.populate('room');
	return this.room;
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
		name: playerName,
		username: user.username,
		discordId: user.id,
		playerId: playerId,
		channelId: channel.id,
		room: world.rooms[0]
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
	for(const player of players){
		world.getChannel();
		console.log('Loaded player: '+player.username);
	}
	return true;
}

module.exports = Player;