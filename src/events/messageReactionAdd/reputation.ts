import { ReputationConfig, reputationLogger, announceReputationChange } from '../../core/reputation.js'
import { prisma } from '../../core/prisma.js'
import { XP } from '@robojs/xp'
import { MessageReaction, User, Message } from 'discord.js'

export default async (reaction: MessageReaction, user: User) => {
	// Ignore bots
	if (user.bot) return

	// Check emoji
	const emojiName = reaction.emoji.name
	if (emojiName !== ReputationConfig.emoji && reaction.emoji.toString() !== ReputationConfig.emoji) {
		return
	}

	// Fetch message if partial
	if (reaction.message.partial) {
		try {
			await reaction.message.fetch()
		} catch (error) {
			reputationLogger.error('Something went wrong when fetching the message:', error)
			return
		}
	}

	const message = reaction.message as Message
	if (!message.guildId || !message.author) return

	// Prevent thanking yourself
	if (message.author.id === user.id) {
		reputationLogger.debug(`User ${user.id} tried to thank themselves.`)
		return
	}

	const channel = message.channel
	let question = null

	try {
		// Case 1: Thread/Forum (Answer is in the thread)
		if (channel.isThread()) {
			question = await prisma.reputationQuestion.findFirst({
				where: {
					channelId: channel.id, // Thread ID
					resolved: false
				}
			})
		}

		// Case 2: Reply in Text Channel (Answer is a reply to the question)
		if (!question && message.reference?.messageId) {
			question = await prisma.reputationQuestion.findUnique({
				where: {
					messageId: message.reference.messageId,
					resolved: false
				}
			})
		}

		// If no active question found, return
		if (!question) {
			reputationLogger.debug(`No active question found for reaction in ${channel.id}`)
			return
		}

		// Verify reactor is the asker
		if (question.userId !== user.id) {
			reputationLogger.debug(`User ${user.id} is not the asker (${question.userId})`)
			return
		}

		reputationLogger.debug(`Awarding reputation to ${message.author.id} for answer accepted by ${user.id}`)

		// Award Reputation
		await XP.addXP(message.guildId, message.author.id, ReputationConfig.points.answer, {
			storeId: ReputationConfig.storeId,
			reason: 'answer_accepted'
		})

		await announceReputationChange(message.guildId, message.author.id, ReputationConfig.points.answer, 'Answer accepted')

		// Mark as resolved
		await prisma.reputationQuestion.update({
			where: { id: question.id },
			data: { resolved: true }
		})

		// Send confirmation
		/*await message.reply({
			content: `✅ **Problem Solved!**\n${user} has accepted this answer and awarded **+${ReputationConfig.points.answer} Reputation** to ${message.author}!`
		})*/

	} catch (error) {
		reputationLogger.error('Error handling reputation reaction:', error)
	}
}
