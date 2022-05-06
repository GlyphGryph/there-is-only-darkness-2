const Player = require('./player.js');

const Broadcast = {
	personal: async function(player, message){
		return player.getChannel().then(async channel => {
			channel.send(message);
		});
	},
	shaped: async function(room, source, personalMessage, otherMessage){
		let sourcePlayer = source;
		let otherPlayers = await Player.find({room: room._id, _id: {$ne: source._id}});
		sourcePlayer.getChannel().then(async channel => {
			channel.send(personalMessage);
		});
		otherPlayers.forEach(player=>{
			player.getChannel().then(async channel => {
				channel.send(otherMessage);
			});
		});
	},
	unshaped: async function(room, message){
		let players = await Player.find({room: room._id});
		this.getChannel().then(async channel => {
			channel.send(message);
		});
	}
}

module.exports = Broadcast