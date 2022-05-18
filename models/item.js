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
	
	static async create(templateId, inventoryId){
		let template = ItemTemplateManager.get(templateId);
		return await Item.query().insert({
			name: template.name,
			description: template.description,
			inventoryId: inventoryId,
			templateId: templateId
		}).returning('*');
	}
	
	//*************
	//Instance Methods
	//*************
	async getDescription(){
		return this.name+" \n"+this.description;
	}
	
	getTemplate(){
		return ItemTemplateManager.get(this.templateId);
	}
	
	async moveTo(inventoryId){
		this.inventoryId = inventoryId;
		await this.$query().update();
	}
}

module.exports = Item;