const BaseModel = require('./base_model');
const { Model } = require('objection');
const buildingTemplates = require('../buildingTemplates');
const Broadcast = require('../broadcast');

class Building extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'buildings';
  }
	
  static get relationMappings() {
    const Room = require('./room');
		const Item = require('./item');
		const Inventory = require('./inventory');

    return {
      room: {
        relation: Model.BelongsToOneRelation,
        modelClass: Room,
        join: {
          from: 'buildings.roomId',
          to: 'rooms.id',
        },
      },
			inventory: {
				relation: Model.BelongsToOneRelation,
				modelClass: Inventory,
				join: {
					from: 'buildings.inventoryId',
					to: 'inventories.id'
				}
			},
			items: {
				relation: Model.ManyToManyRelation,
				modelClass: Item,
				join: {
					from: 'buildings.inventoryId',
					through: {
						from: 'inventories.id',
						to: 'inventories.id'
					},
					to: 'items.inventoryId'
				}
			}
    }
  }
	
	//*************
	//Instance Methods
	//*************
	
	async destroy(){
		await this.$query().delete();
		return true;
	}
	
	getDescription(){
		let type = 'Building';
		if(!this.complete){
			type = 'Scaffold';
		}
		return type+": "+this.getName()+"\n"+this.getTemplate().description;
	}

	getName(){
		return this.getTemplate().name
	};

	getTemplate(){
		return buildingTemplates.get(this.templateId);
	}

	async build(player){
		let progressChange = 1;
		this.complete = true;
		await this.$query().update();
		Broadcast.shaped(player, player.otherPlayers(),
			"You worked on the new "+this.getName()+" and added an additional "+progressChange+" progress.",
			player.name+" worked on the new "+this.getName()+" and added an additional "+progressChange+" progress."
		);
	}
}

module.exports = Building;