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

const World = mongoose.model('World', worldSchema);

worldSchema.methods.getCategoryChannel = async function(){
	// Get channel if it exists, create it if it does not
	let categoryChannel = await global.game.client.channels.fetch(this.categoryChannelId).catch(async err => {
		console.log('Channel does not exist, creating channel.');
		let channelName = this.name.split(' ').join('-');
		let channel = await global.game.guild.channels.create(channelName, {
			type: 'GUILD_CATEGORY',
			reason: 'World channel could not be found.'
		});
		this.categoryChannelId = channel.id;
		await this.save();
		return channel;
	});
}

worldSchema.methods.nextPlayerId = async function(){
	return this.players.length;
}

worldSchema.methods.hasUser = async function(discordId){
	let found = await this.players.find(player => {
		return player.discordId == discordId;
	});
	return 'undefined' != typeof found
}

worldSchema.methods.destroy = async function(){
	let players = this.players.find();
	for(const player of players){
		player.destroy();
	}
	this.categoryChannel.delete();
	await World.deleteOne(this);
}

World.create = async function(){
	let displayId = global.game.newWorldDisplayId;
	let name = 'w'+displayId;
	global.game.newWorldDisplayId++;
	let channelname = await name.split(' ').join('-');
	let categoryChannel = await global.game.guild.channels.create(channelname, {
		type: 'GUILD_CATEGORY',
		reason: 'New world was created.'
	});
	
	// Create world object to save later
	var world = new World({
		displayId: displayId,
		name: name,
		categoryChannelId: categoryChannel.id
	});
	
	// Add rooms
	world.rooms = [{
		description: 'The formless void',
		exits:[]
	},{
		description: 'The world of light and shadow.',
		exits:[]
	}];
	
	// Save world data
	return world.save().then(result => {
		console.log('Created new world: '+world.name);
		global.game.forgeChannel.send('Created new world: '+world.name);

	}).catch(err => {
		console.log('Failed to create new world.');
		console.log(err);
		categoryChannel.delete();
		global.game.forgeChannel.send('Could not create world.');
	});
}

World.load = async function(){
	const worlds = await World.find();
	for(const world of worlds){
		let categoryChannel = await global.game.client.channels.fetch(world.categoryChannelId).catch(async err => {
			console.log('error');
			let channelName = world.name.split(' ').join('-');
			let channel = await global.game.guild.channels.create(channelName, {
				type: 'GUILD_CATEGORY',
				reason: 'New world was created.'
			});
			world.categoryChannelId = channel.id;
			await world.save();
			return channel;
		});
		console.log('Loaded world: '+world.name);
		global.game.newWorldDisplayId = Math.max(world.displayId+1, global.game.newWorldDisplayId);
		//Player.load(world);
	}
	World.list();
	return true;
}

World.list = async function(){
	let worlds = await World.find();
	if(worlds.length > 0){
		worldList = worlds.map(world =>{ return world.name });
		global.game.forgeChannel.send('Worlds ('+global.game.worlds.length+'): '+worldList.join(', '));
	} else {
		global.game.forgeChannel.send('No worlds exist.');
	}
}

module.exports = World;