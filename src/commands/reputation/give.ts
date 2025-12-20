import { XP } from '@robojs/xp'
import { createCommandConfig } from '@robojs/discordjs'
import type { CommandOptions } from '@robojs/discordjs'
import { ChatInputCommandInteraction, User, PermissionFlagsBits } from 'discord.js'
import { ReputationConfig, announceReputationChange } from '../../core/reputation.js'

export const config = createCommandConfig({
	description: 'Give reputation to a user',
	defaultMemberPermissions: PermissionFlagsBits.Administrator,
	options: [
		{
			name: 'user',
			description: 'The user to give reputation to',
			type: 'user',
			required: true
		},
		{
			name: 'amount',
			description: 'Amount of reputation to give',
			type: 'integer',
			required: true
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	const user = options.user as User
	const amount = options.amount as number

	await XP.addXP(interaction.guildId!, user.id, amount, {
		storeId: ReputationConfig.storeId,
		reason: 'admin_give'
	})

	await announceReputationChange(interaction.guildId!, user.id, amount, 'Admin action')

	return {
		content: `Given **${amount}** reputation to ${user}.`,
		ephemeral: true
	}
}
