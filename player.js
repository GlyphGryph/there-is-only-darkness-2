const { Permissions } = require('discord.js');
var World = require('./world.js');

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
			permissionOverwrites: [
				{
					id: gameState.guild.id,
					deny: [Permissions.FLAGS.VIEW_CHANNEL],
				},
				{
					id: author.id,
					allow: [Permissions.FLAGS.VIEW_CHANNEL],
				},
			],
		}).then(channel => {
			player.channel = channel;
			let everyoneRole = gameState.guild.roles.everyone;
			console.log('Author has '+everyoneRole);
			channel.permissionOverwrites.edit(everyoneRole, { VIEW_CHANNEL: false })
			.then(channel => console.log(channel.permissionOverwrites.get(everyoneRole)))
			.catch(console.error);;
			channel.permissionOverwrites.edit(author.id, { VIEW_CHANNEL: true });
			channel.setParent(world.categoryChannel.id);
		});
	}
}

module.exports = Player;