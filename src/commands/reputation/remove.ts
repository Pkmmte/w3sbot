import { XP } from '@robojs/xp'
import { createCommandConfig, type CommandOptions } from 'robo.js'
import { ChatInputCommandInteraction, User, PermissionFlagsBits } from 'discord.js'
import { ReputationConfig, announceReputationChange } from '../../core/reputation.js'

export const config = createCommandConfig({
	description: 'Remove reputation from a user',
	defaultMemberPermissions: PermissionFlagsBits.Administrator,
	options: [
		{
			name: 'user',
			description: 'The user to remove reputation from',
			type: 'user',
			required: true
		},
		{
			name: 'amount',
			description: 'Amount of reputation to remove',
			type: 'integer',
			required: true
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	const user = options.user as User
	const amount = options.amount as number

	await XP.removeXP(interaction.guildId!, user.id, amount, {
		storeId: ReputationConfig.storeId,
		reason: 'admin_remove'
	})

	await announceReputationChange(interaction.guildId!, user.id, -amount, 'Admin action')

	return {
		content: `Removed **${amount}** reputation from ${user}.`,
		ephemeral: true
	}
}
