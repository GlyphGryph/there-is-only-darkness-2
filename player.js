const { Permissions } = require('discord.js');
var World = require('./world.js');
var PlayerChannel = require('./playerChannel.js');

class Player {
	gamestate; world; username; discordId; playerId; playerChannel;

	constructor(gameState, world, author){
		var player = this;
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
			reason: 'Player joined world',
		}).then(channel => {
			player.channel = channel;
			channel.setParent(world.categoryChannel.id);
			let everyoneRole = gameState.guild.roles.everyone;
			
			channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
			channel.permissionOverwrites.edit(author.id, { VIEW_CHANNEL: true });
			
			this.playerChannel = new PlayerChannel(player.gameState, channel, world, player);
		});
	}
}

module.exports = Player;