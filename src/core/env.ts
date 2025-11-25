import { Env } from 'robo.js'

export const env = new Env({
	context7: {
		apiKey: {
			description: 'Context7 API key',
			env: 'CONTEXT7_API_KEY',
			required: true
		}
	},
	discord: {
		errorChannelId: {
			description: 'Discord error channel ID',
			env: 'DISCORD_DEBUG_CHANNEL_ID'
		}
	},
	logger: {
		level: {
			default: 'info',
			description: 'Logger level',
			env: 'LOGGER_LEVEL'
		}
	}
})
