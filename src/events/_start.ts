import { portal } from 'robo.js'
import fs from 'fs'

/**
 * @type {import('robo.js').Config}
 **/
const updateModulesStatus = () => {
	const jsonString = fs.readFileSync('./modules.json', 'utf8')
	const json = JSON.parse(jsonString)
	console.log(json)
	const modules = json.modules
	try {
		for (let i = 0; i < modules.length; i++) {
			portal.module(modules[i].name).setEnabled(modules[i].isEnabled)
		}
	} catch (error) {
		throw error
	}
}

export default async () => {
	console.log(process.env.NODE_ENV)
	try {
		updateModulesStatus()
	} catch (error) {
		console.log(error)
	}
}
