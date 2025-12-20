import { createCommandConfig } from '@robojs/discordjs'
import { Flashcore } from 'robo.js'
import type { ChatInputCommandInteraction, CommandOptions } from '@robojs/discordjs'

export const config = createCommandConfig({
	description: 'Sets a channel for audit logs',
	options: [
		{
			name: 'channel',
			required: true,
			description: 'Set a channel where audit logs will be stored',
			type: 'channel'
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	try {
		await Flashcore.set(
			'audit-log-channel',
			JSON.stringify({
				channelName: options.channel.name,
				channelId: options.channel.id
			}),
			{
				namespace: interaction.guildId!
			}
		)

		return `Audit log channel set - <#${options.channel.id}>`
	} catch (e) {
		console.error(e)
	}
}
