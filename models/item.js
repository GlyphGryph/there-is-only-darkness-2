const BaseModel = require('./base_model');
const { Model } = require('objection');
const ItemTemplateManager = require('../ItemTemplateManager');

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
		return this.getTemplate().name+" \n"+this.getTemplate().description;
	}
	
	getTemplate(){
		return ItemTemplateManager.get(templateId);
	}
}

module.exports = Item;