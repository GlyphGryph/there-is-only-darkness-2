const BaseModel = require('./base_model');
const { Model } = require('objection');
const Broadcast = require('../broadcast');

class Player extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'players'
  }
	
  static get relationMappings() {
    const World = require('./world');
    const Room = require('./room.js');
		const Inventory = require('./inventory');
		const Item = require('./item');

    return {
      world: {
        relation: Model.BelongsToOneRelation,
        modelClass: World,
        join: {
          from: 'players.worldId',
          to: 'worlds.id',
        },
      },
			room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'players.roomId',
          to: 'rooms.id',
        },
      },
			inventory: {
				relation: Model.BelongsToOneRelation,
				modelClass: Inventory,
				join: {
					from: 'players.inventoryId',
					to: 'inventories.id'
				}
			},
			items: {
				relation: Model.ManyToManyRelation,
				modelClass: Item,
				join: {
					from: 'players.inventoryId',
					through: {
						from: 'inventories.id',
						to: 'inventories.id'
					},
					to: 'items.inventoryId'
				}
			}
    }
  }
	
	static async create(world, user){
		console.log('Attempting to create player');
		let discordId = user.id;
		let playerId = await world.getNextPlayerId();
		let playerName = "Player "+playerId;
		let channelName = world.name.toLowerCase().split(" ").join("-")+'-player-'+playerId;
		let startingRoom = await world.$relatedQuery('rooms').first();
		try{
			// Create persisted player
			let player = await Player.query().insertGraph({
				name: playerName,
				username: user.username,
				discordId: user.id,
				worldId: world.id,
				roomId: startingRoom.id,
				inventory: {}
			}).returning('*');

			player.getChannel();
			console.log('Player successfully joined world!');
			global.game.forgeChannel.send(player.username+' joined world '+world.name)
		} catch(err){
			console.log('Failed to create new player.');
			console.log(err);
			global.game.forgeChannel.send('Could not join world.');
			channel.delete();
		};
	}

	static async load(world){
		let players = await world.$relatedQuery('players');
		for(const player of players){
			player.getChannel();
			console.log('Loaded player: '+player.username);
		}
		return true;
	}
	
	static async otherPlayers(player){
		return await Player.query().where({roomId: player.roomId}).whereNot({id: player.id});
	}
		
	//*************
	//Instance Methods
	//*************
	async getDescription(){
		let textSoFar = "Name: "+this.name;
		let items = await this.$relatedQuery('items');
		if(items.length > 0){
			textSoFar += "\nItems: "+items.map(item => {
				return item.name;
			}).join(", ");
		}
		return textSoFar;
	}

	async destroy(){
		await this.$relatedQuery('items').delete();
		let inventory = await this.$relatedQuery('inventory');
		await this.getChannel().then(channel=>{ channel.delete()});
		await this.$query().delete();
		await inventory.$query().delete();
		return true;
	};
	
	async emote(message){
		let players = await Player.query().where({roomId: this.roomId});
		Broadcast.unshaped(players, "*"+this.name+message+"*");
	}

	async findInInventory(targetName){
		return await this.$relatedQuery('items').findOne('name', 'ilike', targetName);
	}

	async getChannel(){
		let channel = await global.game.client.channels.fetch(this.channelId).catch(async err => {
			console.log('Channel for '+this.name+' not found, creating channel.');
			let channelName = this.name.split(' ').join('-');
			let channel = await global.game.guild.channels.create(channelName, {
				type: 'GUILD_TEXT',
				reason: 'Player joined world',
			});
			let world = await this.$relatedQuery('world');
			let categoryChannel = await world.getCategoryChannel();
			if(channel.parentId != categoryChannel.id){
				await channel.setParent(categoryChannel.id);
				let everyoneRole = await global.game.guild.roles.everyone;
				let user = await global.game.guild.members.fetch({user: this.discordId});
				console.log('DiscordId is '+this.discordId);
				await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false });
				await channel.permissionOverwrites.edit(user, { VIEW_CHANNEL: true });
			}
			this.channelId = channel.id;
			await this.$query().update();
			return channel;
		});
		return channel;
	};

	async moveTo(newRoom, method, direction){
		let oldRoom = await this.$relatedQuery('room');
		let oldRoomPlayers = await Player.query().where({roomId: oldRoom.id}).whereNot({id: this.id});
		let newRoomPlayers = await Player.query().where({roomId: newRoom.id}).whereNot({id: this.id});
		let player = this;
		let directions = {
			forwards: {opposite: 'backwards'},
			backwards: {opposite: 'forwards'}
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
		await Broadcast.unshaped(oldRoomPlayers, descriptions[method].othersGoing);
		await Broadcast.unshaped(newRoomPlayers, descriptions[method].othersComing);
		player.roomId = newRoom.id;
		return await player.$query().update().returning('*');
	}
	
	async say(message){
		let otherPlayers = await Player.otherPlayers(this);
		Broadcast.shaped(this, otherPlayers, 'You say "'+message+'"', this.name+' says "'+message+'"');
	}
}

module.exports = Player