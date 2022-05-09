const BaseModel = require('./base_model');
const { Model } = require('objection');

class Room extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'rooms'
  }
	
  static get relationMappings() {
    const World = require('./world');
    const Player = require('./player');
		const Inventory = require('./inventory');

    return {
      world: {
        relation: Model.BelongsToOneRelation,
        modelClass: World,
        join: {
          from: 'players.worldId',
          to: 'world.id',
        },
      },
			players: {
				relation: Model.HasOneRelation,
				modelClass: Player,
				join: {
					from: 'rooms.id',
					to: 'players.roomId'
				}
			},
			inventory: {
				relation: Model.BelongsToOneRelation,
				modelClass: Inventory,
				join: {
					from: 'rooms.inventoryId',
					to: 'inventories.id'
				}
			}
    }
  }
	
	async destroy(){
		return await this.$query.delete();
	};

	/*
	roomSchema.methods.addBuilding = async function(key){
		this.buildings ||= [];
		this.buildings.push({key: key, progress: 0})
		return this.save();
	};

	roomSchema.methods.addItem = async function(item){
		this.items.push(item);
		await this.save();
		return false;
	};

	roomSchema.methods.addScaffold = async function(key){
		this.scaffolds ||= [];
		this.scaffolds.push({key: key, progress: 0})
		return this.save();
	};

	roomSchema.methods.findIn = async function(targetName){
		let type = 'none';
		console.log(this.items);
		let found = this.items.find(item=>{return item.name.toLowerCase()==targetName;});
		if(found){
			type = 'Item';
		}else{
			found = await Player.findOne({room: this, name: new RegExp("^"+targetName, "i")});
			if(found){
				type = 'Player';
			}
			// TODO: Add building support
		}
		
		return {type: type, value: found};
	};

	roomSchema.methods.findInBuildings = async function(targetName){
		return this.buildings.find(building=>{return building.getName().toLowerCase()==targetName;});
	}

	roomSchema.methods.findInScaffolds = async function(targetName){
		return this.scaffolds.find(scaffold=>{return scaffold.getName().toLowerCase()==targetName;});
	}

	roomSchema.methods.getExit = function(name){
		found = this.exits.find(exit => {
			return exit.name == name;
		});
		if('undefined' == typeof found){
			return null;
		} else {
			return found;
		}
	};

	roomSchema.methods.getExitsDescription = async function(){
		let exitNames = this.exits.map(exit => {
			return exit.name;
		});
		if(exitNames.length > 0){
			return "You see "+exitNames.length+" exits: "+exitNames.join(" ");
		} else {
			return "There are no exits!";
		}
	};

	roomSchema.methods.removeItem = async function(item){
		index = this.items.indexOf(item);
		if(index >= 0){
			this.items.splice(index, 1);
			await this.save();
			return true;
		} else {
			return false;
		}
	};
	*/
}

module.exports = Room;