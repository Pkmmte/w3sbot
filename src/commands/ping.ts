import { createCommandConfig } from '@robojs/discordjs'
import type { ChatInputCommandInteraction } from '@robojs/discordjs'

export const config = createCommandConfig({
	description: 'Ping the bot '
} as const)

export default async (interaction: ChatInputCommandInteraction) => {
	return { content: 'ponggg', ephemeral: true }
}
