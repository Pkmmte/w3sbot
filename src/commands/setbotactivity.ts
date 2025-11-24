import { createCommandConfig } from 'robo.js'
import { ChatInputCommandInteraction, ActivityType } from 'discord.js'
import { type CommandOptions } from 'robo.js'

const generateActivities = (): { name: string; value: number }[] => {
	const activityArray = []

	for (const key in ActivityType) {
		if (isNaN(Number(key))) {
			activityArray.push({ name: key, value: ActivityType[key] })
		}
	}

	return activityArray
}

export const config = createCommandConfig({
	description: 'Set bot activity',
	options: [
		{
			name: 'activity',
			description: 'Activity',
			type: 'number',
			required: true,
			choices: generateActivities()
		},
		{
			name: 'text',
			description: 'Add some custom text',
			type: 'string',
			required: false
		}
	]
} as const)

export default async (interaction: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	interaction.client.user.setPresence({
		activities: [
			{
				name: options.text ? options.text : '🤩',
				type: options.activity
			}
		]
	})

	return {
		content: `Bot activity set`,
		ephemeral: true
	}
}
