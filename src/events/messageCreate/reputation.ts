import { ReputationConfig, reputationLogger, announceReputationChange } from '../../core/reputation.js'
import { prisma } from '../../core/prisma.js'
import { XP } from '@robojs/xp'
import { Message } from 'discord.js'

export default async (message: Message) => {
	// Ignore bots
	if (message.author.bot) return

	const { channel, guildId, author } = message
	if (!guildId) return

	// Check if channel is configured
	let isTracked = false

	// Direct match (Text Channel)
	if (ReputationConfig.channels.includes(channel.id)) {
		isTracked = true
	}
	// Parent match (Forum Post / Thread)
	else if (channel.isThread() && channel.parentId && ReputationConfig.channels.includes(channel.parentId)) {
		// Only track the starter message of the thread (Forum Post)
		if (message.id === channel.id) {
			isTracked = true
		}
	}

	if (!isTracked) {
		reputationLogger.debug(`Channel ${channel.id} is not tracked for reputation.`)
		return
	}

	// Award Reputation & Track
	try {
		reputationLogger.debug(`Awarding reputation to ${author.id} for question in ${channel.id}`)
		
		// Award XP (Reputation)
		await XP.addXP(guildId, author.id, ReputationConfig.points.question, {
			storeId: ReputationConfig.storeId,
			reason: 'question_asked'
		})

		await announceReputationChange(guildId, author.id, ReputationConfig.points.question, 'Asked a question')

		// Track in DB
		await prisma.reputationQuestion.create({
			data: {
				channelId: channel.id,
				messageId: message.id,
				userId: author.id,
				resolved: false
			}
		})
	} catch (error) {
		reputationLogger.error('Error tracking reputation question:', error)
	}
}
