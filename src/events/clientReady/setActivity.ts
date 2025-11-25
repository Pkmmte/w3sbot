import { ActivityType, Client } from 'discord.js'
import { Mode } from 'robo.js'

export default async (client: Client) => {
	client.user?.setActivity({
		name: Mode.is('production') ? '✨ Learning on W3Schools' : '✨ Built with Robo.js',
		type: ActivityType.Custom
	})
}
