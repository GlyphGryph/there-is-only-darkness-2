const Broadcast = {
	personal: async function(player, message){
		return player.getChannel().then(async channel => {
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
	}
}

module.exports = Broadcast