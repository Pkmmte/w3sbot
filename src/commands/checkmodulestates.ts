import { createCommandConfig } from '@robojs/discordjs'
import { portal } from 'robo.js'
import { Modules, PortalModule } from '../types/types.js'
import { generateEmbedMessage } from './utils/modules-message-template.js'

export const config = createCommandConfig({
	description: 'Gets a list of all modules and their states'
} as const)

export default async () => {
	try {
		const modules: PortalModule[] = []

		for (const [key, value] of Object.entries(Modules)) {
			modules.push({
				moduleName: key,
				isEnabled: portal.module(value).isEnabled()
			})
		}

		const message = generateEmbedMessage(modules)
		return { embeds: [message], ephemeral: true }
	} catch (error) {
		console.log(error)
	}
}
