import { createCommandConfig } from 'robo.js'
import type { CommandOptions } from 'robo.js'

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

export default async (interaction, options: CommandOptions<typeof config>) => {
	try {
		const channelId = options.channel.match(/\d+/)[0]
		const messagesNumber = options.number.match(/\d+/)[0]

		const channel = interaction.guild.channels.cache.get(channelId)
		return channel
			.bulkDelete(Number(messagesNumber))
			.then(() => {
				channel.send('Messages deleted successfully')
			})
			.cache((error) => {
				channel.send(JSON.stringify(error))
			})
	} catch (error) {
		console.log(error)
	}
}
