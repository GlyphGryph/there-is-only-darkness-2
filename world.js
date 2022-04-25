var Player = require('./player.js');

class World {
	gameState; id; name; categoryChannel;
	players = [];
	nextPlayerId = 0;

	constructor(gameState){
		this.gameState = gameState;
		this.id = gameState.newWorldId;
		this.name = 'World '+gameState.newWorldId;
		gameState.newWorldId++;
		gameState.worlds.push(this);
		gameState.guild.channels.create(this.name, {
			type: 'GUILD_CATEGORY',
			reason: 'New world was created.'
		}).then(categoryChannel => {
			this.categoryChannel = categoryChannel;
		});
	}
	
	has_user(discordId){
		let found = this.players.find(player => {
			return player.discordId == discordId;
		});
		return 'undefined' != typeof found
	}
}

module.exports = World;