import { ChatInputCommandInteraction, createCommandConfig } from '@robojs/discordjs'
import type { CommandOptions } from '@robojs/discordjs'
import { stopAndDeleteQuotesJob } from '../utils/utils.js'
import { QuoteCategory } from '../../../types/types.js'

const categoryChoices = []
for (const category in QuoteCategory) {
	categoryChoices.push({
		name: category,
		value: category.toLowerCase()
	})
}

export const config = createCommandConfig({
	description: 'STOPS CRON job for active quotes category',
	options: [
		{
			name: 'category',
			required: true,
			description: 'Choose quote category',
			choices: categoryChoices
		}
	]
} as const)

export default async (_event: ChatInputCommandInteraction, options: CommandOptions<typeof config>) => {
	const category = options.category as string
	try {
		await stopAndDeleteQuotesJob(category)
		return { content: `Quotes instance for category ${category} stopped`, ephemeral: true }
	} catch (error) {
		console.log(error)
	}
}
