const mongoose = require('mongoose');
const 	Player = require('./player.js');
const PlayerChannel = require('./playerChannel.js');
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
	}]
}, {timestamps: true})

worldSchema.methods.hasUser = function hasUser(playerId){
	return false;
	/*let found = this.players.find(player => {
		return player.discordId == discordId;
	});
	return 'undefined' != typeof found*/
};
worldSchema.methods.findOrCreateCategory = function findOrCreateCategory(){
	
}

const PersistedWorld = mongoose.model('World', worldSchema);

class World {
	game; persistedWorld; categoryChannel;
	players;
	
	constructor(game, persistedWorld, categoryChannel){
		this.game = game;
		this.persistedWorld = persistedWorld;
		this.categoryChannel = categoryChannel;
		
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
	
	has_user(discordId){
		let found = this.players.find(player => {
			return player.discordId == discordId;
		});
		return 'undefined' != typeof found
	}
}

World.create = async function(game){
	let displayId = game.newWorldDisplayId;
	let name = 'World '+game.newWorldDisplayId;
	game.newWorldDisplayId++;
	let channelName = name.split(' ').join('-');
	let categoryChannel = await game.guild.channels.create(channelName, {
		type: 'GUILD_CATEGORY',
		reason: 'New world was created.'
	});
	console.log("display Id is "+game.newWorldDisplayId);
	console.log(name);
	var persistedWorld = new PersistedWorld({
		displayId: displayId,
		name: name,
		categoryChannelId: categoryChannel.id
	});
	return persistedWorld.save().then(result => {
		let world = new World(game, persistedWorld, categoryChannel);
		console.log('Created new world: '+world.name);
		game.forgeChannel.send('Created new world: '+world.name);
		game.worlds.push(this);
	}).catch(err => {
		console.log('Failed to create new world.');
		console.log(err);
		game.forgeChannel.send('Could not create world.');
		categoryChannel.delete();
	});
}

World.load = async function(game){
	const persistedWorlds = await PersistedWorld.find();
	for(const persistedWorld of persistedWorlds){
		let categoryChannel = await game.client.channels.fetch(persistedWorld.categoryChannelId);
		let world = new World(game, persistedWorld, categoryChannel);
		console.log('Loaded world: '+persistedWorld.name);
		game.worlds.push(this);
		game.newWorldDisplayId = Math.max(world.displayId+1, game.newWorldDisplayId);
		//Player.load(world)
	}
	return true;
}

module.exports = World;