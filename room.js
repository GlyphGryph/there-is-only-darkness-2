const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	description: String,
	exits: [{
		to: {type: Schema.Types.ObjectId, ref: "Room"},
		label: String,
	}]
});

class Room {
	world; persistedRoom; exits;
	
	constructor(world, persistedRoom){
		this.world = world;
		this.persistedRoom = persistedRoom;
		this.exits = [];
	}
	
	addExit(){
		// Todo
	};
}

exports.roomSchema = roomSchema;
exports.Room = Room;