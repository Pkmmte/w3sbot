import { Flashcore, createCommandConfig } from 'robo.js'
import type { CommandOptions } from 'robo.js'

export const config = createCommandConfig({
  description: 'Sets a channel for audit logs',
  options: [
    {
      name: 'channel',
      required: true,
      description: 'Set a channel where audit logs will be stored'
    }
  ]
} as const)

export default async (interaction, options: CommandOptions<typeof config>) => {
  const channelId = options.channel.match(/\d+/)[0];
  const channelName = interaction.guild.channels.cache.get(channelId).name;
  console.log(channelId,channelName)

	try {
    await Flashcore.set('audit-log-channel', JSON.stringify({
      channelName: channelName,
      channelId: channelId
    }), {
      namespace: interaction.guildId
    });

    return `Audit log channel set - <#${channelId}>`;
	} catch(e) {
    console.error(e)
  }
}
