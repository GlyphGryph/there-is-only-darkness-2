const buildingTemplates = new Map();
buildingTemplates.set('stickman', { 
	id: 'stickman',
	name: "Stick Man",
	description: "A man made of sticks",
	cost: [
		{type: 'stick', amount: 2}
	],
	baseDurability: 10,
	workToComplete: 5,
	setupWork: 3
});
buildingTemplates.set('rockpile', {
	id: 'rockpile',
	name: "Rock Pile",
	description: "A pile of rocks.",
	cost: [
		{type: 'rock', amount: 3}
	],
	baseDurability: 10,
	workToComplete: 100,
	setupWork: 1
});

const buildingTemplatesByName = new Map();
buildingTemplates.forEach((building, key, map)=>{
	buildingTemplatesByName.set(building.name.toLowerCase(), building);
});

buildingTemplates.names = function(){
	return [...this.values()].map(building => {return building.name});
};

buildingTemplates.findByName = function(name){
	return buildingTemplatesByName.get(name);
};

module.exports = buildingTemplates;