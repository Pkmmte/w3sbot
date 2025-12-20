import { CommandOptions, createCommandConfig } from '@robojs/discordjs'
import { CommandInteraction } from 'discord.js'

export const config = createCommandConfig({
	description: 'Disband a study group',
	options: [
		{
			name: 'group_id',
			description: 'The ID of the study group to disband',
			type: 'string',
			required: true
		}
	]
} as const)

export default async (_interaction: CommandInteraction, options: CommandOptions<typeof config>) => {
	const { group_id } = options

	const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/disband`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': process.env.LEARN_TOGETHER_API_KEY!
		},
		body: JSON.stringify({
			groupId: group_id
		})
	})

	const data = await response.json()

	if (data.success) {
		return `Group ${group_id} disbanded successfully.`
	} else {
		return `Failed to disband group: ${JSON.stringify(data)}`
	}
}
