export enum Modules {
	AuditLog = 'audit-log',
	W3SGoogle = 'w3sgoogle',
	MediaChannels = 'media-channels',
	Collector = 'collector'
}

export interface PortalModule {
	moduleName: string
	isEnabled: boolean
}

export interface CollectedMessage {
	id?: string
	discordUserId: string
	discordUsername: string
	discordMessageId: string
	content: string
	embeds?: any
	category: CollectedMessageCategory
	collectedAt?: string | number
}

export interface QuoteInstance {
	id?: string
	channelId: string
	category: QuoteCategory
	isRunning: number
	cronId?: string
	cronHour: number
	createdAt?: number
	updatedAt?: number
}

export interface Quote {
	id?: string
	text?: string
	author?: string
}

export enum QuoteCategory {
	Inspirational = 'inspirational',
	Programming = 'programming',
	Funny = 'funny'
}

export enum CollectedMessageCategory {
	Idea = 'idea',
	Feedback = 'feedback',
	Question = 'question'
}
