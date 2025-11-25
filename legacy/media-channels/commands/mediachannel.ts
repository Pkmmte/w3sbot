import { Flashcore, createCommandConfig } from 'robo.js'
import type { CommandOptions } from 'robo.js'

export const config = createCommandConfig({
	description: 'Sets a channel as media only channel',
	options: [
		{
			name: 'channel',
			required: true,
			description: 'Choose a channel'
		}
	]
} as const)

export default async (interaction, options: CommandOptions<typeof config>) => {
	const channelId = options.channel.match(/\d+/)[0]
	const channelName = interaction.guild.channels.cache.get(channelId).name

	try {
		await Flashcore.set(
			'media-channel',
			JSON.stringify({
				channelName: channelName,
				channelId: channelId
			}),
			{
				namespace: interaction.guildId
			}
		)

		const mediaChannel = interaction.member.guild.channels.cache.get(channelId)
		mediaChannel.permissionOverwrites
			.create(interaction.guild.roles.everyone, {
				VIEW_CHANNEL: 1,
				SEND_MESSAGES: 0,
				ATTACH_FILES: 1
			})
			.then(() => console.log('Permissions set successfully for @everyone!'))
			.catch(console.error)
		return `Media-only channel set - <#${channelId}>`
	} catch (e) {
		console.error(e)
	}
}
