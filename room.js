const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
	description: String,
	exits: [{
		to: {type: Schema.Types.ObjectId, ref: "Room"},
		name: String,
	}]
});

roomSchema.methods.destroy = async function(){
	await Room.deleteOne(this);
	return true;
}

roomSchema.methods.getExit = function(name){
	found = this.exits.find(exit => {
		return exit.name == name;
	});
	if('undefined' == typeof found){
		return null;
	} else {
		return found;
	}
}

roomSchema.methods.getExitsDescription = async function(){
	let exitNames = this.exits.map(exit => {
		return exit.name;
	});
	if(exitNames.length > 0){
		return "You see "+exitNames.length+" exits: "+exitNames.join(" ");
	} else {
		return "There are no exits!";
	}
}

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;