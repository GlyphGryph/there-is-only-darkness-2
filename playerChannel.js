var Player = require('./player.js');

class PlayerChannel {
	gameState; player; world; channel;
	
	constructor(gameState, channel, world, player){
		this.gameState = gameState;
		this.world = world;
		this.player = player;
		this.channel = channel;
		this.gameState.playerChannelsById.set(this.channel.id, this);
		this.world.playerChannels.push(this);
	}
}


module.exports = PlayerChannel;