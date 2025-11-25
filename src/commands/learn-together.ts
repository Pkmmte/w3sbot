import {
	CommandInteraction,
	ComponentType,
	Colors,
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle
} from 'discord.js'

export const config = {
	description: 'Simulate the Learn Together handoff process',
	options: [
		{
			name: 'group_id',
			description: 'The ID of the study group',
			type: 'string',
			required: true
		},
		{
			name: 'group_name',
			description: 'The name of the study group',
			type: 'string',
			required: true
		}
	]
}

export default async (interaction: CommandInteraction, options: { group_id: string; group_name: string }) => {
	const { group_id, group_name } = options

	const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/handoff`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': process.env.LEARN_TOGETHER_API_KEY!
		},
		body: JSON.stringify({
			w3sUserId: 'simulated-user-' + interaction.user.id,
			groupId: group_id,
			groupName: group_name
		})
	})

	const data = await response.json()

	if (data.redirectUrl) {
		const button = new ButtonBuilder()
			.setLabel('Join Study Group')
			.setStyle(ButtonStyle.Link)
			.setURL(data.redirectUrl)

		const actionRow = new ActionRowBuilder().addComponents(button)

		return {
			flags: MessageFlags.IsComponentsV2,
			components: [
				{
					type: ComponentType.Container,
					accentColor: Colors.Blurple,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `## 🎓 Join Study Group: ${group_name}\n\nReady to learn together? Click the button below to join your study group and start collaborating!`
						}
					]
				},
				actionRow
			]
		}
	} else {
		return `Failed to initiate handoff: ${JSON.stringify(data)}`
	}
}
