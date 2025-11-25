import Discord from '@robojs/auth/providers/discord'
import EmailPassword from '@robojs/auth/providers/email-password'
import { createPrismaAdapter } from '@robojs/auth'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@prisma-generated/client'
import type { AuthPluginOptions } from '@robojs/auth'

export const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! }) })

const adapter = createPrismaAdapter({ client: prisma, secret: process.env.AUTH_SECRET! })

const config: AuthPluginOptions = {
	adapter: adapter,
	appName: 'W3Schools',
	pages: {
		newUser: '/dashboard',
		signIn: '/login'
	},
	providers: [
		Discord({ clientId: process.env.DISCORD_CLIENT_ID, clientSecret: process.env.DISCORD_CLIENT_SECRET }),
		EmailPassword({
			adapter
		})
	],
	secret: process.env.AUTH_SECRET
}

export default config
