const BaseModel = require('./base_model');
const { Model } = require('objection');

class Exit extends BaseModel {
	//*************
	//Class Methods
	//*************
  static get tableName() {
    return 'exits'
  }
	
  static get relationMappings() {
		const Room = require('./room');

    return {
      source: {
        relation: Model.HasOneRelation,
        modelClass: Room,
        join: {
          from: 'exits.sourceId',
          to: 'rooms.id',
        }
      },
			destination: {
        relation: Model.HasOneRelation,
        modelClass: Room,
        join: {
          from: 'exits.sourceId',
          to: 'rooms.id',
        }
			}
		};
	}
}


module.exports = Exit;