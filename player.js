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
		console.log('Channel for '+this.name+' not found, creating channel.');
		let channelName = this.name.split(' ').join('-');
		let channel = await global.game.guild.channels.create(channelName, {
			type: 'GUILD_TEXT',
			reason: 'Player joined world',
		});
		await this.populate('world');
		let categoryChannel = await this.world.getCategoryChannel();
		if(channel.parentId != categoryChannel.id){
			await channel.setParent(categoryChannel.id);
			let everyoneRole = await global.game.guild.roles.everyone;
			console.log('DiscordId is '+this.discordId);
			await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
			await channel.permissionOverwrites.edit(this.discordId, { VIEW_CHANNEL: true });
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
		if(players.length > 0){ 
			textSoFar += '\n---\nOther players at this location: ';
			console.log(players);
			let playerNames = players.map(player=>{return player.name});
			console.log(playerNames);
			textSoFar += playerNames.join(", ");
		}
		
		channel.send(textSoFar);
	});
}

playerSchema.methods.moveTo = async function(newRoom, method, direction){
	let oldRoomPlayers = await Player.find({room: this.room._id, _id: {$ne: this._id}});
	this.room = newRoom;
	let newRoomPlayers = await Player.find({room: this.room._id, _id: {$ne: this._id}});
	let player = this;
	let directions = {
		forward: {opposite: 'backwards'},
		backwards: {opposite: 'forward'}
	};
	let descriptions = {
		move: {
			own: 'You move '+direction+'.',
			othersGoing: this.name+' moves away to the '+direction+'.',
			othersComing: this.name+' moves into the room from the '+directions[direction].opposite
		}
	};
	this.getChannel().then(async channel => {
		channel.send(descriptions[method].own);
	});
	oldRoomPlayers.forEach(player=>{
			player.getChannel().then(channel => {
				channel.send(descriptions[method].othersGoing);
			});
	});
	newRoomPlayers.forEach(player=>{
		player.getChannel().then(channel => {
			channel.send(descriptions[method].othersComing);
		});
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

	// Create persisted player
	let player = new Player({
		world: world,
		name: playerName,
		username: user.username,
		discordId: user.id,
		playerId: playerId,
		room: world.rooms[0]
	});

	// Create and hook up actual player object
	return player.save().then(async result => {
		player.getChannel();
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
	await world.populate('players');
	for(const player of world.players){
		player.getChannel();
		console.log('Loaded player: '+player.username);
	}
	return true;
}

module.exports = Player;