var World = require('./models/world.js');
var Player = require('./models/player.js');
const config = require('./config.json');

class Game{
	client; newWorldDisplayId; worlds; playerChannelsById;
	config;
	guild; monitorChannel; forgeChannel;
	constructor(client){
		this.client = client;
		this.newWorldDisplayId = 0;
		this.config = config;
	}
	
	async load(){
		// Load Worlds
		return World.load(this);
	}
}

module.exports = Game;