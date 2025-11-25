import { OpenAiEngine } from '@robojs/ai/engines/openai'
// import { env } from '@/core/env.js'
import { Colors, ComponentType, SeparatorSpacingSize } from 'discord.js'
import { MessageFlags } from 'discord.js'
import { logger } from 'robo.js'
import type { ChatReply, PluginOptions, ReplyHookContext } from '@robojs/ai'

const instructions =
	'You are a helpful tutor for our W3Schools Discord server. You are here to help users with their questions and provide them with the best possible answers. Rely on the Context7 MCP tool often when asked for web development information, using docs for the "websites/w3schools" library. Always assume you have access to this tool via "get-library-docs" and always rely on it for web development information rather than your own knowledge. When using this tool, always include source links in your replies relating to the content you pulled from the library at the end of each message, using the format "<sources>\nSource: <link>\n\</sources>".'

export const config: PluginOptions = {
	commands: ['/ai imagine'],
	engine: new OpenAiEngine({
		chat: {
			model: 'gpt-5.1',
			reasoningEffort: 'low'
		},
		voice: {
			model: 'gpt-realtime'
		}
	}),
	whitelist: {
		channelIds: process.env.AI_WHITELIST_CHANNEL_IDS?.split(',') ?? []
	},
	mcpServers: [
		{
			type: 'mcp',
			server_label: 'context7',
			server_url: 'https://mcp.context7.com/mcp',
			headers: { CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY },
			allowed_tools: ['resolve-library-id', 'get-library-docs'],
			require_approval: 'never'
		}
	],
	hooks: {
		reply: (context: ReplyHookContext): ChatReply | void => {
			const { response, mcpCalls } = context
			let content = response.message?.content ?? ''
			const isContext7Used = mcpCalls?.some((call) => call.serverLabel === 'context7')

			if (typeof content !== 'string' || !isContext7Used) {
				return
			}

			// Parse sources from the response content
			logger.debug('Parsing sources from response content')
			const sourcesRegex = /<sources>([\s\S]*?)<\/sources>/
			const match = content.match(sourcesRegex)
			let sources: string[] = []

			if (match) {
				content = content.replace(sourcesRegex, '').trim()
				sources = match[1]
					.split('\n')
					.map((line) => line.trim())
					.filter((line) => line.toLowerCase().startsWith('source: '))
					.map((line) => line.substring(8).trim())
			}

			// Split content by "---" to create sections
			const sections = content.split(/\n\s*---\s*\n/)
			const components: any[] = []

			sections.forEach((section, index) => {
				if (section.trim()) {
					components.push({
						type: ComponentType.TextDisplay,
						content: section.trim()
					})
				}

				// Add separator if it's not the last section
				if (index < sections.length - 1) {
					components.push({
						type: ComponentType.Separator,
						divider: true,
						spacing: SeparatorSpacingSize.Large
					})
				}
			})

			// Add sources container if sources exist
			if (sources.length > 0) {
				components.push({
					type: ComponentType.Container,
					accentColor: Colors.Green,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: '## Learn more:\n' + sources.join('\n')
						}
					]
				})
			}

			// Return the modified response if changes were made
			if (content !== response.message?.content || components.length > 0) {
				return {
					flags: MessageFlags.IsComponentsV2,
					components: components
				}
			}
		}
	},
	voice: {
		instructions: instructions,
		playbackVoice: 'ash'
	},
	instructions: instructions
} satisfies PluginOptions
export default config
