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
          from: 'items.inventoryId',
          to: 'inventory.id',
        },
      }
    }; 
  }
	
	//*************
	//Instance Methods
	//*************
	
	async getDescription(){
		return this.name+" \n"+this.description;
	}
}

module.exports = Item;