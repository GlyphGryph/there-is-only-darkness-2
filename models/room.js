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
		const Building = require('./building');

    return {
			buildings: {
				relation: Model.HasManyRelation,
				modelClass: Building,
				join: {
					from: 'rooms.id',
					to: 'buildings.roomId'
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
			entrances: {
				relation: Model.HasManyRelation,
				modelClass: Exit,
				join: {
					from: 'rooms.id',
					to: 'exits.destinationId'
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
			players: {
				relation: Model.HasOneRelation,
				modelClass: Player,
				join: {
					from: 'rooms.id',
					to: 'players.roomId'
				}
			},
			world: {
        relation: Model.BelongsToOneRelation,
        modelClass: World,
        join: {
          from: 'players.worldId',
          to: 'world.id',
        },
      }
    }
  }
	
	//*************
	//Instance Methods
	//*************
	
	async addItem(item){
		this.items.push(item);
		await this.save();
		return false;
	}
	
	async destroy(){
		await this.$relatedQuery('exits').delete();
		await this.$relatedQuery('entrances').delete();
		let buildings = await this.$relatedQuery('buildings');
		for(const building of buildings){
			await building.destroy();
		};
		await this.$relatedQuery('items').delete();
		let inventory = await this.$relatedQuery('inventory');
		await this.$query().delete();
		await inventory.$query().delete();
		return true;
	}
	
	async findInInventory(targetName){
		return await this.$relatedQuery('items').findOne('name', 'ilike', targetName);
	}

	async findIn(targetName){
		let type = 'none';
		console.log(this.items);
		let item = await this.$relatedQuery('items').findOne('name', 'ilike', targetName);
		if(item){
			return {type: 'Item', value: item};
		}
		let player = await this.$relatedQuery('players').findOne('name', 'ilike', targetName)
		if(player){
			return {type: 'Player', value: player};
		}
		console.log(targetName);
		let building = await this.findInBuildings(targetName);
		if(building){
			return {type: 'Building', value: building};
		}
		let scaffold = await this.findInScaffolds(targetName);
		if(scaffold){
			return {type: 'Scaffold', value: scaffold};
		}
		return {type: 'none', value: 'none'};
	};
	
	async findInBuildings(targetName){
		let buildings = await this.getFunctionalBuildings();
		return buildings.find(building=>{ return building.getName().toLowerCase() == targetName.toLowerCase() })
	}
	
	async findInScaffolds(targetName){
		let scaffolds = await this.getScaffolds();
		return scaffolds.find(scaffold=>{ return scaffold.getName().toLowerCase() == targetName.toLowerCase() })
	}
	
	async getFunctionalBuildings(){
		return await this.$relatedQuery('buildings').where({complete: true});
	}
	
	async getScaffolds(){
		return await this.$relatedQuery('buildings').where({complete: false});
	}

	async getExit(name){
		return this.$relatedQuery('exits').findOne({name: name});
	};

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
}

module.exports = Room;