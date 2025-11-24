import { createCommandConfig } from 'robo.js'
import type { CommandOptions } from 'robo.js'
import { portal } from 'robo.js'
import { Modules } from '../types/types.js'

const moduleChoices = []
for (const [key, value] of Object.entries(Modules)) {
	moduleChoices.push({
		name: key,
		value: value
	})
}

export const config = createCommandConfig({
	description: 'Sets enabled or disabled state of a module',
	options: [
		{
			name: 'module',
			required: true,
			description: 'Choose a module',
			choices: moduleChoices
		},
		{
			name: 'state',
			required: true,
			description: 'Set a state of a module',
			choices: [
				{
					name: 'Enabled',
					value: '1'
				},
				{
					name: 'Disabled',
					value: '0'
				}
			]
		}
	]
} as const)

export default async (event, options: CommandOptions<typeof config>) => {
	try {
		const module = options.module as string
		const state = Boolean(Number(options.state))
		portal.module(module).setEnabled(state)
		if (state) {
			return `${module} is enabled.`
		} else {
			return `${module} is disabled.`
		}
	} catch (error) {
		console.log(error)
	}
}
