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
		const Item = require('./item');
		const Exit = require('./exit');

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
			exits: {
				relation: Model.HasManyRelation,
				modelClass: Exit,
				join: {
					from: 'rooms.id',
					to: 'exits.sourceId'
				}
			},
			inventory: {
				relation: Model.BelongsToOneRelation,
				modelClass: Inventory,
				join: {
					from: 'rooms.inventoryId',
					to: 'inventories.id'
				}
			},
			items: {
				relation: Model.ManyToManyRelation,
				modelClass: Item,
				join: {
					from: 'rooms.inventoryId',
					through: {
						from: 'inventories.id',
						to: 'inventories.id'
					},
					to: 'items.inventoryId'
				}
			},
			
    }
  }
	
	async destroy(){
		return await this.$query().delete();
	};

	
	/*async addBuilding(key){
		this.buildings ||= [];
		this.buildings.push({key: key, progress: 0})
		return this.save();
	};*/

	async addItem(item){
		this.items.push(item);
		await this.save();
		return false;
	};

	/*async addScaffold(key){
		this.scaffolds ||= [];
		this.scaffolds.push({key: key, progress: 0})
		return this.save();
	};*/
	
	async findInInventory(targetName){
		return await this.$relatedQuery('items').findOne('name', 'ilike', targetName);
	}

	async findIn(targetName){
		let type = 'none';
		console.log(this.items);
		let items = await this.$relatedQuery('items');
		let found = items.find(item=>{return item.name.toLowerCase()==targetName;});
		if(found){
			type = 'Item';
		}else{
			players = room.$relatedQuery('players').findOne('name', 'ilike', targetName)
			await Player.findOne({room: this, name: new RegExp("^"+targetName+"$", "i")});
			if(found){
				type = 'Player';
			}
			// TODO: Add building support
		}
		
		return {type: type, value: found};
	};
/*
	async findInBuildings(targetName){
		return this.buildings.find(building=>{return building.getName().toLowerCase()==targetName;});
	}

	async findInScaffolds(targetName){
		return this.scaffolds.find(scaffold=>{return scaffold.getName().toLowerCase()==targetName;});
	}

	async getExit(name){
		found = this.exits.find(exit => {
			return exit.name == name;
		});
		if('undefined' == typeof found){
			return null;
		} else {
			return found;
		}
	};
*/

	async getExitsDescription(){
		let exits = await this.$relatedQuery('exits');
		let exitNames = exits.map(exit => {
			return exit.name;
		});
		if(exitNames.length > 0){
			return "You see "+exitNames.length+" exits: "+exitNames.join(" ");
		} else {
			return "There are no exits!";
		}
	};

/*
	async removeItem(item){
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