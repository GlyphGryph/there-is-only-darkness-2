var World = require('./world.js');
var Player = require('./player.js');
const config = require('./config.json');

class Game{
	client; newWorldDisplayId; worlds; playerChannelsById;
	config;
	guild; generalChannel; forgeChannel;
	constructor(client){
		this.client = client;
		this.newWorldDisplayId = 0;
		this.worlds = [];
		this.playerChannelsById = new Map();
		this.config = config;
	}
	
	async load(){
		// Load Worlds
		return World.load(this);
	}
}

module.exports = Game;