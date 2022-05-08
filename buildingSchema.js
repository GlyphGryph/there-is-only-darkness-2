const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const buildingTemplates = require('./buildingTemplates');
const Broadcast = require('./broadcast.js');

const buildingSchema = new Schema({
	key: String,
	durability: Number 
});


const scaffoldSchema = new Schema({
	key: String,
	progress: Number,
	completed: { type: Boolean, default: false }
});

buildingSchema.methods.getName = function(){
	return this.getTemplate().name
};

buildingSchema.methods.getTemplate = function(){
	return buildingTemplates.get(this.key);
}

scaffoldSchema.methods.getName = function(){
	return this.getTemplate().name
};

scaffoldSchema.methods.getTemplate = function(){
	return buildingTemplates.get(this.key);
}

scaffoldSchema.methods.build = async function(player){
	let progressChange = 1;
	this.progress += progressChange;
	this.parent().save();
	let template = buildingTemplates.get(this.key);
	if(this.progress >= template.workToComplete){
		await this.remove();
		await room.save();
		await room.addBuilding(template.id);
		Broadcast.shaped(player.room, player,
			"You completed work on the new "+template.name+".",
			player.name+" completed work on the new "+template.name+"."
		);
	}else{
		Broadcast.shaped(player.room, player,
			"You worked on the new "+template.name+" and added an additional "+progressChange+" progress.",
			player.name+" worked on the new "+template.name+" and added an additional "+progressChange+" progress."
		);
	}
}

exports.buildingSchema = buildingSchema;
exports.scaffoldSchema = scaffoldSchema;