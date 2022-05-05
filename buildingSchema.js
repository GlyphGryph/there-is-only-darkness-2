const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const buildingTemplates = require('./buildingTemplates');

const buildingSchema = new Schema({
	key: String,
	durability: Number 
});


const scaffoldSchema = new Schema({
	key: String,
	progress: Number,
});

buildingSchema.methods.getName = function(){
	return buildingTemplates[this.key].name
};

scaffoldSchema.methods.getName = function(){
	return buildingTemplates[this.key].name
};

exports.buildingSchema = buildingSchema;
exports.scaffoldSchema = scaffoldSchema;