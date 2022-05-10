const BaseModel = require('./base_model');
const { Model } = require('objection');
const Room = require('./room');
const Player = require('./player');

class World extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'worlds'
  }
	
  static get relationMappings() {
    const Player = require('./player')
		const Room = require('./room')

    return {
      players: {
        relation: Model.HasManyRelation,
        modelClass: Player,
        join: {
          from: 'worlds.id',
          to: 'players.worldId',
        },
      },
			rooms: {
        relation: Model.HasManyRelation,
        modelClass: Room,
        join: {
          from: 'worlds.id',
          to: 'rooms.worldId',
        },
      }
    }
  }
	
	static async create(){
		let displayId = global.game.newWorldDisplayId;
		let name = 'w'+displayId;
		global.game.newWorldDisplayId++;
		let channelname = await name.split(' ').join('-');
		let categoryChannel = await global.game.guild.channels.create(channelname, {
			type: 'GUILD_CATEGORY',
			reason: 'New world was created.'
		});

		try{
			// Create world object to save later
			let world = await World.query().insert({
				displayId: displayId,
				name: name,
				categoryChannelId: categoryChannel.id
			}).returning('*');
			
			// Add rooms
			let room1 = await Room.query().insertGraph({
				description: 'The formless void.',
				worldId: world.id,
				inventory: {}
			}).returning('*');
			
			let room2 = await Room.query().insertGraph({
				description: 'The world of light and shadow.',
				worldId: world.id,
				inventory: {}
			}).returning('*');
			/* TODO: Add inventory, add items, add exits
			room2.exits=[{to: room1, name: "backwards"}]
			await room2.save();
			room1.exits=[{to: room2, name: "forward"}]
			await room1.save();
			*/
			
			console.log('Created new world: '+world.name);
			global.game.forgeChannel.send('Created new world: '+world.name);
		} catch(err){
			console.log('Failed to create new world.');
			console.log(err);
			categoryChannel.delete();
			await global.game.forgeChannel.send('Could not create world.');
			throw err;
		};
	}

	static async load(){
		const worlds = await World.query();
		for(const world of worlds){
			world.getCategoryChannel();
			console.log('Loaded world: '+world.name);
			global.game.newWorldDisplayId = Math.max(world.displayId+1, global.game.newWorldDisplayId);
			Player.load(world);
		}
		World.list();
		return true;
	}

	static async list(){
		let worlds = await World.query();
		if(worlds.length > 0){
			let worldList = worlds.map(world =>{ return world.name });
			global.game.forgeChannel.send('Worlds ('+worlds.length+'): '+worldList.join(', '));
		} else {
			global.game.forgeChannel.send('No worlds exist.');
		}
	}
	 
	//*************
	//Instance Methods
	//*************
	async destroy(){
		let players = await this.$relatedQuery('players');
		for(const player of players){
			await player.destroy();
		}
		let rooms = await this.$relatedQuery('rooms');
		for(const room of rooms){
			room.destroy();
		}
		this.getCategoryChannel().then(channel=>{channel.delete()});
		await this.$query().delete();
		global.game.forgeChannel.send('Destroyed world '+this.name);
	}
	
	async hasUser(discordId){
		let player = await this.$relatedQuery('players').findOne({discordId: discordId});
		return !!player;
	}
	
	async getCategoryChannel(){
		// Get channel if it exists, create it if it does not
		let categoryChannel = await global.game.client.channels.fetch(this.categoryChannelId).catch(async err => {
			console.log('Channel does not exist, creating channel.');
			let channelName = this.name.split(' ').join('-');
			let channel = await global.game.guild.channels.create(channelName, {
				type: 'GUILD_CATEGORY',
				reason: 'World channel could not be found.'
			});
			this.categoryChannelId = channel.id;
			await this.$query().update();
			return channel;
		});
		return categoryChannel;
	}
	
	async getNextPlayerId(){
		return await this.$relatedQuery('players').resultSize();
	}
}

module.exports = World