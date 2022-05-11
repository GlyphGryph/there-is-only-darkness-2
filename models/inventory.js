const BaseModel = require('./base_model');
const { Model } = require('objection');

class Inventory extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'inventories';
  }
	
  static get relationMappings() {
    const Player = require('./player');
		const Room = require('./room');

    return {
      room: {
        relation: Model.HasOneRelation,
        modelClass: Room,
        join: {
          from: 'inventories.id',
          to: 'rooms.inventoryId',
        },
      },
			player: {
				relation: Model.HasOneRelation,
				modelClass: Player,
				join: {
					from: 'inventories.id',
					to: 'players.inventoryId'
				}
			},
			items: {
				relation: Model.HasManyRelation,
				modelClass: Item,
				join: {
					from: 'inventories.id',
					to: 'items.inventoryId'
				}
			}
    }; 
  }
}

module.exports = Inventory;