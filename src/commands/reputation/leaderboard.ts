import { leaderboard } from '@robojs/xp'
import { createCommandConfig } from '@robojs/discordjs'
import { ChatInputCommandInteraction, Colors } from 'discord.js'
import { ReputationConfig } from '../../core/reputation.js'

export const config = createCommandConfig({
	description: 'View reputation leaderboard',
	options: []
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	const { entries } = await leaderboard.get(interaction.guildId!, 0, 10, { storeId: ReputationConfig.storeId })
	
	if (!entries || entries.length === 0) {
		return {
			embeds: [
				{
					title: 'Reputation Leaderboard',
					description: 'No reputation data yet!',
					color: Colors.Blurple
				}
			]
		}
	}

	const description = entries
		.map((entry: any, index: number) => {
			return `${index + 1}. <@${entry.userId}> - **${entry.xp}** rep`
		})
		.join('\n')

	return {
		embeds: [
			{
				title: 'Reputation Leaderboard',
				description: description,
				color: Colors.Blurple
			}
		]
	}
}
