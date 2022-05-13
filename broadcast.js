const Broadcast = {
	personal: async function(player, message){
		player.getChannel().then(async channel => {
			channel.send(message);
		});
	},
	shaped: async function(source, others, personalMessage, otherMessage){
		source.getChannel().then(async channel => {
			channel.send(personalMessage);
		});
		others.forEach(player=>{
			player.getChannel().then(async channel => {
				channel.send(otherMessage);
			});
		});
	},
	unshaped: async function(targets, message){
		targets.forEach(target=>{
			target.getChannel().then(async channel => {
				channel.send(message);
			});
		});
	},
	monitor: async function(message){
		global.game.monitorChannel.send(message);
	},
	forge: async function(message){
		global.game.forgeChannel.send(message);
	}
}

module.exports = Broadcast