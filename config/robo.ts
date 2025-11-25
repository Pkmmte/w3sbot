// import { env } from "@/core/env.js";
import type { Config } from 'robo.js'
import type { LogLevel } from "robo.js/logger.js";

export default {
	clientOptions: {
		intents: [
			'Guilds',
			'GuildMessages',
			'MessageContent',
			'GuildMessageReactions',
			'GuildMessageTyping',
			'GuildVoiceStates'
		]
	},
	logger: {
		level: process.env.LOGGER_LEVEL as LogLevel // env.get('logger.level') as LogLevel
	},
	sage: {
		errorChannelId: process.env.DISCORD_DEBUG_CHANNEL_ID // env.get('discord.errorChannelId')
	}
} satisfies Config
