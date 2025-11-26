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
	},
	reputation: {
		channels: {
			description: 'Comma-separated list of channel IDs for reputation tracking',
			env: 'REPUTATION_CHANNELS'
		},
		announceChannelId: {
			description: 'Channel ID for reputation announcements',
			env: 'REPUTATION_ANNOUNCE_CHANNEL_ID'
		},
		reminderCronSchedule: {
			default: '0 0 * * *',
			description: 'Cron schedule for reputation reminders',
			env: 'REPUTATION_REMINDER_CRON_SCHEDULE'
		}
	}
})
