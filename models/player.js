const BaseModel = require('./base_model');
const { Model } = require('objection');

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
			//TODO: Add inventory

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
	/*	await world.populate('players');
		for(const player of world.players){
			player.getChannel();
			console.log('Loaded player: '+player.username);
		}
		return true;*/
	}
		
	//*************
	//Instance Methods
	//*************
	async addItem(item){
		/*this.items.push(item);
		await this.save();
		return false;*/
	}

	description(){
		/*let textSoFar = "Name: "+this.name;
		if(this.items.length > 0){
			textSoFar += "\nItems: "+this.items.map(item => {
				return item.name;
			}).join(", ");
		}
		return textSoFar;*/
	}

	async destroy(){
		/*await Player.deleteOne(this);
		this.getChannel().then(channel=>{ channel.delete()});*/
	};
	
	async emote(message){
		Broadcast.unshaped("*"+this.name+message+"*");
	}

	async findInInventory(targetName){
		/*let type = 'none';
		let found = this.items.find(item=>{return item.name.toLowerCase()==targetName.toLowerCase();});
		if(found){
			type = 'Item';
		}
		
		return {type: type, value: found};*/
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
				console.log('DiscordId is '+this.discordId);
				await channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
				await channel.permissionOverwrites.edit(this.discordId, { VIEW_CHANNEL: true });
			}
			this.channelId = channel.id;
			this.$query().update();
			return channel;
		});
		return channel;
	};

	async getRoom(){
		/*await this.populate('room');
		return this.room;*/
	}

	async moveTo(newRoom, method, direction){
		/*let oldRoomPlayers = await Player.find({room: this.room._id, _id: {$ne: this._id}});
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
		return await this.save();*/
	}

	async removeItem(item){
		/*index = this.items.indexOf(item);
		if(index >= 0){
			this.items.splice(index, 1);
			await this.save();
			return true;
		} else {
			return false;
		}*/
	}
	
	async say(message){
		Broadcast.shaped('You say "'+message+'"', this.name+' says "'+message+'"');
	}
}

module.exports = Player