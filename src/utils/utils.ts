const { MessageEmbed } = require('discord.js')

function generateEmbedMessage(message, eventType) {
	const channel = message.guild.channels.cache.find((ch) => ch.id === message.channelId)
	let event
	switch (eventType) {
		case 'updated':
			event = 'UPDATE'
			break
		case 'deleted':
			event = 'DELETE'
			break
	}

	const embed = new MessageEmbed()
		.setColor(0x0099ff)
		.setTitle(`AUDIT LOG EVENT: ${event}`)
		.addFields({
			name: 'ACTION: ',
			value: `Message ${eventType}`
		})
		.addFields({
			name: 'USER: ',
			value: `${message.author.username}${message.author.discriminator === '0' ? '' : '#' + message.author.discriminator} (${message.author.id})`
		})
		.addFields({
			name: 'CHANNEL: ',
			value: `${channel.name}`
		})

	if (eventType === 'updated') {
		embed
			.addFields({
				name: 'Old message content',
				value: message.content
			})
			.addFields({
				name: 'New message content',
				value: message.reactions.message.content
			})
	} else if (eventType === 'deleted') {
		embed.addFields({
			name: 'Deleted message content',
			value: message.content
		})
	}

	embed.setTimestamp()
	return embed
}

export function generateSearchEmbedMessage(response) {
	const embed = new MessageEmbed().setColor(0x0099ff).setTitle(`Search Results`)

	if (response && response.results.length > 0) {
		for (let i = 0; i < response.results.length; i++) {
			const r = response.results[i]
			embed.addFields({
				name: `[${r.url}](${r.url})`,
				value: `${r.description})`
			})
		}
	}

	embed.setTimestamp()
	return embed
}

export default generateEmbedMessage
