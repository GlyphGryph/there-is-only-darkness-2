const BaseModel = require('./base_model');
const { Model } = require('objection');

class Item extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'items';
  }
	
  static get relationMappings() {
    const Inventory = require('./inventory');
		const Room = require('./room');

    return {
      inventory: {
        relation: Model.BelongsToOneRelation,
        modelClass: Inventory,
        join: {
          from: 'rooms.inventoryId',
          to: 'inventory.id',
        },
      }
    }; 
  }
}

module.exports = Item;