const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = require('./itemSchema');
const Player = require('./player.js');

const roomSchema = new Schema({
	description: String,
	exits: [{
		to: {type: Schema.Types.ObjectId, ref: "Room"},
		name: String,
	}],
	items: [itemSchema]
});

roomSchema.methods.destroy = async function(){
	await Room.deleteOne(this);
	return true;
};

roomSchema.methods.getExit = function(name){
	found = this.exits.find(exit => {
		return exit.name == name;
	});
	if('undefined' == typeof found){
		return null;
	} else {
		return found;
	}
};

roomSchema.methods.getExitsDescription = async function(){
	let exitNames = this.exits.map(exit => {
		return exit.name;
	});
	if(exitNames.length > 0){
		return "You see "+exitNames.length+" exits: "+exitNames.join(" ");
	} else {
		return "There are no exits!";
	}
};

roomSchema.methods.findIn = async function(targetName){
	let type = 'none';
	console.log(this.items);
	let found = this.items.find(item=>{return item.name.toLowerCase()==targetName.toLowerCase();});
	if(found){
		type = 'Item';
	}else{
		found = await Player.findOne({room: this, name: new RegExp("^"+targetName, "i")});
		if(found){
			type = 'Player';
		}
	}
	
	return {type: type, value: found};
};

roomSchema.methods.removeItem = async function(item){
	index = this.items.indexOf(item);
	if(index >= 0){
		this.items.splice(index, 1);
		await this.save();
		return true;
	} else {
		return false;
	}
}

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;