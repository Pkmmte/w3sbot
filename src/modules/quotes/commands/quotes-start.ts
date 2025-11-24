import { createCommandConfig } from 'robo.js'
import type { CommandOptions } from 'robo.js'
import { createOrStartQuotesJob } from '../utils/utils.js'
import { QuoteInstance, QuoteCategory } from '../../../types/types.js'

const timeChoices = []
for (let i = 1; i <= 24; i++) {
	const time = i < 10 ? `0${i}` : i
	timeChoices.push({
		name: `At ${time}:00`,
		value: i.toString()
	})
}

const categoryChoices = []
for (const category in QuoteCategory) {
	categoryChoices.push({
		name: category,
		value: category.toLowerCase()
	})
}

export const config = createCommandConfig({
	description: 'Starts CRON job for sending quotes in set interval',
	options: [
		{
			name: 'channel',
			required: true,
			description: 'Choose a channel'
		},
		{
			name: 'category',
			required: true,
			description: 'Choose quote category',
			choices: categoryChoices
		},
		{
			name: 'time',
			required: true,
			description: 'Once a day, at: ',
			choices: timeChoices
		}
	]
} as const)

export default async (event, options: CommandOptions<typeof config>) => {
	const channelId = (options.channel as string).replace(/[<>\#]/g, '')
	const category = options.category as QuoteCategory
	const time = Number(options.time)

	const data: QuoteInstance = {
		channelId: channelId,
		category: category,
		isRunning: 1,
		cronId: category as string,
		cronHour: time
	}

	const success = createOrStartQuotesJob(data, event)
	if (success) {
		return { content: `Quotes instance for category ${category} started`, ephemeral: true }
	} else {
		return { content: `Failed to start quotes instance for category ${category}`, ephemeral: true }
	}
}
