import { Flashcore } from 'robo.js'
import { ModalSubmitInteraction, TextChannel } from 'discord.js'

export default async (interaction: any) => {
	console.log(interaction)
	if (interaction.isModalSubmit()) {
		const i = interaction as ModalSubmitInteraction
		if (i.customId === 'custom_message') {
			try {
				const channelID = await Flashcore.get('message_channel_id')
				const fields = i.fields.fields as any
				const channel = i.guild.channels.cache.get(channelID as string) as TextChannel
				const msg = fields.get('message').value
				channel.send({ content: msg })
				i.reply({ content: 'Message sent', ephemeral: true })
			} catch (error) {
				console.log(error)
			}
		}
	}
}
