import { EmbedBuilder } from 'discord.js'

export default {
	generateEmbedMessage: (message, eventType, attachmentsSize, executor) => {
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

		const embed = new EmbedBuilder()
			.setColor(0x0099ff)
			.addFields({
				name: `Message ${eventType} in a channel <#${channel.id}>`,
				value: '\u200B',
				inline: true
			})
			.addFields({
				name: 'Message owner: ',
				value: `${message.author.username}${message.author.discriminator === '0' ? '' : '#' + message.author.discriminator} (${message.author.id})`
				// value: `<#${message.author.username}>` // Currently doesn't work due to discord issues
			})

		if (eventType === 'updated') {
			embed
				.addFields({
					name: 'Old message content',
					value: message.content.length > 0 ? message.content : '*Textual message content is empty*'
				})
				.addFields({
					name: 'New message content',
					value:
						message.reactions.message.content.length > 0
							? message.reactions.message.content
							: '*Textual message content is empty*'
				})
		} else if (eventType === 'deleted') {
			embed.addFields({
				name: 'Deleted message content',
				value: message.content.length > 0 ? message.content : '*Textual message content is empty*'
			})
		}

		if (attachmentsSize > 0) {
			embed.addFields({
				name: 'Attachments: ',
				value: String(attachmentsSize)
			})
		}

		if (executor) {
			embed.addFields({
				name: 'Executor (username): ',
				value: `${executor.username}`
			})
		}

		embed.setTimestamp()
		return embed
	}
}

export function generateSearchEmbedMessage(response) {
	const embed = new EmbedBuilder().setColor(0x0099ff).setTitle(`Search Results`)

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
