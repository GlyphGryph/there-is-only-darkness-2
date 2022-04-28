const mongoose = require('mongoose');
const Player = require('./player.js');
const {Room, roomSchema} = require('./room.js');
const Schema = mongoose.Schema;

const worldSchema = new Schema({
	displayId: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	categoryChannelId: {
		type: String,
		required: true
	},
	players: [{
		type: Schema.Types.ObjectId,
		ref: "Player"
	}],
	rooms: [roomSchema]
}, {timestamps: true})

const PersistedWorld = mongoose.model('World', worldSchema);

class World {
	game; persistedWorld; categoryChannel;
	players; rooms;
	
	constructor(game, persistedWorld, categoryChannel){
		this.game = game;
		this.persistedWorld = persistedWorld;
		this.categoryChannel = categoryChannel;
		this.players = [];
		this.rooms = [];
		
		return this;
	}
	
	get displayId(){
		return this.persistedWorld.displayId;
	}
	get name(){
		return this.persistedWorld.name;
	}
	get categoryChannel(){
		return this.categoryChannel;
	}
	
	get nextPlayerId(){
		return this.persistedWorld.players.length
	}
	
	async save(){
		await this.persistedWorld.save();
		return this;
	}
	
	has_user(discordId){
		let found = this.players.find(player => {
			return player.discordId == discordId;
		});
		return 'undefined' != typeof found
	}
	
	async destroy(){
		for(const player of this.players){
			player.destroy();
		}
		await PersistedWorld.deleteOne(this.persistedWorld);
		this.categoryChannel.delete();
		let index = this.game.worlds.indexOf(this);
		this.game.worlds.splice(index, 1);
	}
}

World.create = async function(game){
	let displayId = game.newWorldDisplayId;
	let name = 'w'+displayId;
	game.newWorldDisplayId++;
	let channelname = name.split(' ').join('-');
	let categoryChannel = await game.guild.channels.create(channelname, {
		type: 'GUILD_CATEGORY',
		reason: 'New world was created.'
	});
	
	// Create Persisted world object
	var persistedWorld = new PersistedWorld({
		displayId: displayId,
		name: name,
		categoryChannelId: categoryChannel.id
	});
	
	// Create world object
	let world = new World(game, persistedWorld, categoryChannel);
	game.worlds.push(world);
	
	// Add rooms
	persistedWorld.rooms = [{
		description: 'The formless void',
		exits:[]
	},{
		description: 'The world of light and shadow.',
		exits:[]
	}];
	
	// Save world data
	return persistedWorld.save().then(result => {
		console.log('Created new world: '+world.name);
		game.forgeChannel.send('Created new world: '+world.name);

	}).catch(err => {
		console.log('Failed to create new world.');
		console.log(err);
		let index = game.worlds.indexOf(world);
		game.worlds.splice(index, 1);
		categoryChannel.delete();
		game.forgeChannel.send('Could not create world.');
	});
}

World.load = async function(game){
	const persistedWorlds = await PersistedWorld.find();
	for(const persistedWorld of persistedWorlds){
		let categoryChannel = await game.client.channels.fetch(persistedWorld.categoryChannelId).catch(async err => {
			let channelName = persistedWorld.name.split(' ').join('-');
			let channel = await game.guild.channels.create(channelName, {
				type: 'GUILD_CATEGORY',
				reason: 'New world was created.'
			});
			persistedWorld.categoryChannelId = channel.id;
			await persistedWorld.save();
			return channel;
		});
		let world = new World(game, persistedWorld, categoryChannel);
		console.log('Loaded world: '+persistedWorld.name);
		game.worlds.push(world);
		game.newWorldDisplayId = Math.max(world.displayId+1, game.newWorldDisplayId);
		Player.load(world);
	}
	return true;
}

module.exports = World;