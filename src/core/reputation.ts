import { logger } from 'robo.js'
import { getClient } from '@robojs/discordjs'
import { TextChannel, EmbedBuilder, Colors } from 'discord.js'

export const reputationLogger = logger.fork('reputation')

export const ReputationConfig = {
	get channels() {
		return process.env.REPUTATION_CHANNELS?.split(',').map((id: string) => id.trim()) ?? []
	},
	get announceChannelId() {
		return process.env.REPUTATION_ANNOUNCE_CHANNEL_ID
	},
	emoji: '🙏',
	storeId: 'reputation',
	points: {
		question: 1,
		answer: 5
	},
	interactionIds: {
		solve: 'reputation_solve_',
		select: 'reputation_select_'
	}
} as const

export async function announceReputationChange(_guildId: string, userId: string, amount: number, reason: string) {
	if (!ReputationConfig.announceChannelId) return

	try {
		const channel = await getClient().channels.fetch(ReputationConfig.announceChannelId) as TextChannel
		if (!channel) {
			reputationLogger.warn(`Announcement channel ${ReputationConfig.announceChannelId} not found`)
			return
		}

		const embed = new EmbedBuilder()
			.setColor(amount > 0 ? Colors.Green : Colors.Red)
			.setDescription(`<@${userId}> received **${amount > 0 ? '+' : ''}${amount}** reputation!`)
			.setFooter({ text: reason })
			.setTimestamp()

		await channel.send({ embeds: [embed] })
	} catch (error) {
		reputationLogger.error('Failed to send reputation announcement', error)
	}
}
