import { ActivityType, Client } from 'discord.js'

export default async (client: Client) => {
	client.user?.setActivity({
		name: '✨ Built with Robo.js',
		type: ActivityType.Custom
	})
}
