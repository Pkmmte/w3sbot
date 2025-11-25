import Discord from '@robojs/auth/providers/discord'
import { createFlashcoreAdapter } from '@robojs/auth'
import type { AuthPluginOptions } from '@robojs/auth'

const adapter = createFlashcoreAdapter({ secret: process.env.AUTH_SECRET! })

const config: AuthPluginOptions = {
	adapter: adapter,
	appName: 'W3Schools',
	providers: [Discord({ clientId: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET })],
	secret: process.env.AUTH_SECRET
}

export default config
