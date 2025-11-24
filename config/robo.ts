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
	plugins: [],
	sage: {
		// errorChannelId: '1123381317338415124', // dev
		// DISCORD_DEBUG_CHANNEL_ID: '1123381317338415124' // dev
		errorChannelId: '1121852107943841802', // Production
		DISCORD_DEBUG_CHANNEL_ID: '1121852107943841802' // Production
	}
}
