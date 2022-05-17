class ItemTemplateManager{
	static itemTemplates = new Map();
	
	
	static get(id){
		return ItemTemplateManager.itemTemplates.get(id);
	}
}
ItemTemplateManager.itemTemplates.set('stick', { 
	id: 'stick',
	name: "stick",
	description: "A sticky stick"
});
ItemTemplateManager.itemTemplates.set('rock', {
	id: 'rock',
	name: "rock",
	description: "A rocky rock."
});

	
module.exports = ItemTemplateManager;