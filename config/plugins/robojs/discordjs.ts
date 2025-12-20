import { DiscordConfig } from "@robojs/discordjs";

export default {
	clientOptions: {
		intents: [
			'Guilds',
			'GuildMembers',
			'GuildMessages',
			'MessageContent',
			'GuildMessageReactions',
			'GuildMessageTyping',
			'GuildVoiceStates'
		]
	}
} satisfies DiscordConfig
