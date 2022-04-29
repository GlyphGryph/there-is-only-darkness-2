const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	description: String,
	exits: [{
		to: {type: Schema.Types.ObjectId, ref: "Room"},
		label: String,
	}]
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;