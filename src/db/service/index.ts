import { Flashcore } from 'robo.js'
import type { QuoteInstance } from '../../types/types.js'

const dbService = {
	isModuleEnabled: async (name: string) => {
		const modules = (await Flashcore.get('modules')) as Record<string, boolean>
		return modules?.[name] ?? true // Default to true if not set, matching previous behavior or safe default
	},
	getAllModules: async () => {
		const modules = (await Flashcore.get('modules')) as Record<string, boolean>
		// Convert to array format to match previous return type if needed, or just return the object
		// Previous implementation returned an array of objects from SQL.
		// Let's return an array to maintain compatibility.
		if (!modules) return []
		return Object.entries(modules).map(([name, isEnabled]) => ({ moduleName: name, isEnabled: isEnabled ? 1 : 0 }))
	},
	// AuditLog and MediaChannel methods removed as they are handled in commands directly

	createQuotesInstance: async (data: QuoteInstance) => {
		try {
			const quotesSettings = ((await Flashcore.get('quotesSettings')) as Record<string, QuoteInstance>) || {}
			quotesSettings[data.category] = data
			await Flashcore.set('quotesSettings', quotesSettings)
			return {
				code: 200,
				data: data
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500
			}
		}
	},
	getQuotesInstance: async (category: string) => {
		try {
			const quotesSettings = ((await Flashcore.get('quotesSettings')) as Record<string, QuoteInstance>) || {}
			const instance = quotesSettings[category]
			return {
				code: 200,
				data: instance
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500
			}
		}
	},
	getAllQuotesInstances: async () => {
		try {
			const quotesSettings = ((await Flashcore.get('quotesSettings')) as Record<string, QuoteInstance>) || {}
			return {
				code: 200,
				data: Object.values(quotesSettings)
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500
			}
		}
	},
	updateQuotesInstance: async (isRunning: boolean, category: string) => {
		try {
			const quotesSettings = ((await Flashcore.get('quotesSettings')) as Record<string, QuoteInstance>) || {}
			if (quotesSettings[category]) {
				quotesSettings[category].isRunning = isRunning
				await Flashcore.set('quotesSettings', quotesSettings)
			}
			return {
				code: 200,
				data: quotesSettings[category]
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500
			}
		}
	},
	deleteQuotesInstance: async (category: string) => {
		try {
			const quotesSettings = ((await Flashcore.get('quotesSettings')) as Record<string, QuoteInstance>) || {}
			delete quotesSettings[category]
			await Flashcore.set('quotesSettings', quotesSettings)
			return {
				code: 200,
				data: true
			}
		} catch (error) {
			console.log(error)
			return {
				code: 500
			}
		}
	}
}
export default dbService
