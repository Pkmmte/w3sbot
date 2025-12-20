import { createCommandConfig } from '@robojs/discordjs'
import type { CommandOptions } from '@robojs/discordjs'
import { ChatInputCommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: 'Delete bulk of messages in a channel',
	options: [
		{
			name: 'channel',
			required: true,
			description: 'Choose a channel'
		},
		{
			name: 'number',
			required: true,
			description: 'Number of messages'
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	try {
		const channelId = options.channel.match(/\d+/)![0]
		const messagesNumber = options.number.match(/\d+/)![0]

		const channel = interaction.guild?.channels.cache.get(channelId)
		if (!channel || !channel.isTextBased()) {
			return { content: 'Channel is not a text-based channel', ephemeral: true }
		}

		return channel
			.bulkDelete(Number(messagesNumber))
			.then(() => {
				channel.send('Messages deleted successfully')
			})
			.catch((error) => {
				channel.send(JSON.stringify(error))
			})
	} catch (error) {
		console.log(error)
	}
}
