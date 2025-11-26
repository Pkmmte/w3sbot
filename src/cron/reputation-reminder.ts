import { prisma } from '../core/prisma.js'
import { client } from 'robo.js'
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from 'discord.js'
import { reputationLogger, ReputationConfig } from '../core/reputation.js'

const REMINDER_WINDOW_MS = Number(process.env.REPUTATION_REMINDER_WINDOW_MS) || 24 * 60 * 60 * 1000

export default async () => {
	const now = new Date()
	const twentyFourHoursAgo = new Date(now.getTime() - REMINDER_WINDOW_MS)

	const unresolvedQuestions = await prisma.reputationQuestion.findMany({
		where: {
			resolved: false,
			reminderSent: false,
			createdAt: {
				lt: twentyFourHoursAgo
			}
		}
	})

	reputationLogger.debug(`Found ${unresolvedQuestions.length} unresolved questions to remind.`)

	for (const question of unresolvedQuestions) {
		try {
			const channel = (await client.channels.fetch(question.channelId)) as TextChannel
			if (!channel) continue

			// Fetch the message to reply to
			let message
			try {
				message = await channel.messages.fetch(question.messageId)
			} catch (e) {
				// Message might be deleted
				reputationLogger.debug(`Message ${question.messageId} not found, skipping reminder.`)
				continue
			}

			if (!message) continue

			// Check if anyone else has replied
			const messages = await channel.messages.fetch({ limit: 100 })
			const otherParticipants = messages.filter((m) => !m.author.bot && m.author.id !== question.userId)

			if (otherParticipants.size === 0) {
				reputationLogger.debug(`No other participants found for question ${question.id}, skipping reminder.`)
				continue
			}

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(`${ReputationConfig.interactionIds.solve}${question.id}`)
					.setLabel('Mark as Solved / Thank User')
					.setStyle(ButtonStyle.Success)
					.setEmoji('✅')
			)

			await message.reply({
				content: `👋 Hey <@${question.userId}>! It's been 24 hours. Did you find a solution?\nIf someone helped you, please click the button below to thank them and mark this question as solved!`,
				components: [row]
			})

			// Mark reminder as sent
			await prisma.reputationQuestion.update({
				where: { id: question.id },
				data: { reminderSent: true }
			})
		} catch (error) {
			reputationLogger.error(`Error sending reminder for question ${question.id}:`, error)
		}
	}
}
