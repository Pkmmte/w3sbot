import { XP } from '@robojs/xp'
import { createCommandConfig, type CommandOptions } from 'robo.js'
import { ChatInputCommandInteraction, Colors, User } from 'discord.js'
import { ReputationConfig } from '../../core/reputation.js'

export const config = createCommandConfig({
	description: 'View reputation score',
	options: [
		{
			name: 'user',
			description: 'The user to check',
			type: 'user',
			required: false
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	const user = (options.user) || interaction.user
	const xp = await XP.getXP(interaction.guildId!, user.id, { storeId: ReputationConfig.storeId })
	
	return {
		embeds: [
			{
				title: 'Reputation Score',
				description: `${user} has **${xp}** reputation points!`,
				color: Colors.Blurple,
				thumbnail: {
					url: user.displayAvatarURL()
				}
			}
		]
	}
}
