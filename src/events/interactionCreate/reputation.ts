import { prisma } from '../../core/prisma.js'
import { XP } from '@robojs/xp'
import { ReputationConfig, reputationLogger, announceReputationChange } from '../../core/reputation.js'
import { ActionRowBuilder, UserSelectMenuBuilder, TextChannel } from 'discord.js'

export default async (interaction: any) => {
	// Handle Button Click
	if (interaction.isButton() && interaction.customId.startsWith(ReputationConfig.interactionIds.solve)) {
		const questionId = interaction.customId.replace(ReputationConfig.interactionIds.solve, '')

		const question = await prisma.reputationQuestion.findUnique({
			where: { id: questionId }
		})

		if (!question) {
			reputationLogger.debug(`Question ${questionId} not found for button interaction`)
			return interaction.reply({ content: 'Question not found.', ephemeral: true })
		}

		if (interaction.user.id !== question.userId) {
			return interaction.reply({
				content: 'Only the person who asked the question can use this button.',
				ephemeral: true
			})
		}

		if (question.resolved) {
			return interaction.reply({ content: 'This question is already resolved.', ephemeral: true })
		}

		// Show User Select Menu
		const row = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
			new UserSelectMenuBuilder()
				.setCustomId(`${ReputationConfig.interactionIds.select}${questionId}`)
				.setPlaceholder('Select the user who helped you')
		)

		await interaction.reply({
			content: 'Who helped you solve this problem?',
			components: [row],
			ephemeral: true
		})
	}

	// Handle User Select
	if (interaction.isUserSelectMenu() && interaction.customId.startsWith(ReputationConfig.interactionIds.select)) {
		const questionId = interaction.customId.replace(ReputationConfig.interactionIds.select, '')
		const selectedUserId = interaction.values[0]

		if (selectedUserId === interaction.user.id) {
			return interaction.reply({ content: 'You cannot thank yourself!', ephemeral: true })
		}

		const question = await prisma.reputationQuestion.findUnique({
			where: { id: questionId }
		})

		if (!question || question.resolved) {
			reputationLogger.debug(`Question ${questionId} not found or already resolved for select interaction`)
			return interaction.reply({ content: 'Question not found or already resolved.', ephemeral: true })
		}

		reputationLogger.debug(`Awarding reputation to ${selectedUserId} via button interaction`)

		// Award XP
		await XP.addXP(interaction.guildId, selectedUserId, ReputationConfig.points.answer, {
			storeId: ReputationConfig.storeId,
			reason: 'answer_accepted_via_button'
		})

		await announceReputationChange(interaction.guildId, selectedUserId, ReputationConfig.points.answer, 'Answer accepted via button')

		// Mark resolved
		await prisma.reputationQuestion.update({
			where: { id: questionId },
			data: { resolved: true }
		})

		await interaction.reply({
			content: `✅ You awarded **+${ReputationConfig.points.answer} Reputation** to <@${selectedUserId}>!`,
			ephemeral: true
		})

		// Public confirmation
		try {
			const channel = (await interaction.guild.channels.fetch(question.channelId)) as TextChannel
			if (channel) {
				try {
					const msg = await channel.messages.fetch(question.messageId)
					await msg.reply(
						`✅ **Problem Solved!**\n<@${interaction.user.id}> accepted the answer from <@${selectedUserId}>!`
					)
				} catch (e) {
					await channel.send(
						`✅ **Problem Solved!**\n<@${interaction.user.id}> accepted the answer from <@${selectedUserId}> for question in this channel!`
					)
				}
			}
		} catch (e) {
			reputationLogger.error('Error sending public confirmation:', e)
		}
	}
}
