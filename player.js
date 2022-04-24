var World = require('./world.js');

class Player {
	gamestate; world; username; discordId; playerId; playerChannel;

	constructor(gameState, world, author){
		this.gameState = gameState;
		this.world = world;
		this.world.players.push(this);
		this.username = author.username;
		this.discordId = author.id;
		this.playerId = world.nextPlayerId;
		world.nextPlayerId++;
		let channelName = world.name.toLowerCase().split(" ").join("-")+'player-'+this.playerId;
		gameState.guild.channels.create(channelName, {
			type: 'GUILD_TEXT',
			reason: 'Player joined world'
		}).then(channel => {
			channel.setParent(world.categoryChannel.id);
			this.channel = channel;
		});
	}
}

module.exports = Player;