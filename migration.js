import { Env } from 'robo.js'
import Database from 'better-sqlite3'

Env.loadSync()
const db = new Database('./database/database.db')

const createDatabase = () => {
	const modules = `
    CREATE TABLE IF NOT EXISTS Modules (
      id INTEGER PRIMARY KEY,
      moduleName TEXT NOT NULL,
      isActive INTEGER NOT NULL
    );
  `
	const auditLogs = `CREATE TABLE IF NOT EXISTS AuditLogs (
    id INTEGER PRIMARY KEY,
    content TEXT NOT NULL
  );`

	const audtLogsChannels = `CREATE TABLE IF NOT EXISTS AuditLogsChannel (
    id INTEGER PRIMARY KEY,
    channelName TEXT UNIQUE NOT NULL,
    channelId TEXT NOT NULL
  );`

	const mediaChannels = `CREATE TABLE IF NOT EXISTS MediaChannel (
    id INTEGER PRIMARY KEY,
    channelName TEXT UNIQUE NOT NULL,
    channelId TEXT NOT NULL
  );`

	const collectedMessages = `CREATE TABLE IF NOT EXISTS CollectedMessages (
    id INTEGER PRIMARY KEY,
    discordUserId TEXT NOT NULL,
    discordUsername TEXT NOT NULL,
    discordMessageId TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    collectedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );`

	const alterCollectedMessagesWithEmbedsPragmaQuery = `
    PRAGMA table_info('CollectedMessages');
  `
	const alterCollectedMessagesWithEmbeds = `
    ALTER TABLE CollectedMessages
    ADD COLUMN embeds TEXT;
  `

	const challengeApprovals = `CREATE TABLE IF NOT EXISTS ChallengeApprovals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    isPublished INTEGER DEFAULT 0,
    difficulty INTEGER,
    createdAt INTEGER,
    updatedAt INTEGER,
    publishedAt INTEGER
  );`

	const challenges = `CREATE TABLE IF NOT EXISTS Challenge (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    data TEXT NOT NULL,
    isPublished INTEGER DEFAULT 0,
    difficulty INTEGER,
    createdAt INTEGER,
    updatedAt INTEGER,
    publishedAt INTEGER
  );`

	const quotesSettings = `CREATE TABLE IF NOT EXISTS QuotesSettings (
    id TEXT PRIMARY KEY,
    channelId TEXT NOT NULL,
    category TEXT UNIQUE NOT NULL,
    isRunning INTEGER NOT NULL,
    cronId TEXT UNIQUE NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
  );`

	const alterQuotesSettings = `
    ALTER TABLE QuotesSettings
    ADD COLUMN cronHour INTEGER;
  `

	try {
		// Table creations
		db.prepare(modules)
		db.prepare(auditLogs)
		db.prepare(audtLogsChannels)
		db.prepare(mediaChannels)
		db.prepare(collectedMessages)
		db.prepare(challengeApprovals)
		db.prepare(challenges)
		db.prepare(quotesSettings)
		db.exec(modules)
		db.exec(auditLogs)
		db.exec(audtLogsChannels)
		db.exec(mediaChannels)
		db.exec(collectedMessages)
		db.exec(challengeApprovals)
		db.exec(challenges)
		db.exec(quotesSettings)
		// Alters

		const alterCollectedMessagesWithEmbedsPragmaQueryInfo = db
			.prepare(alterCollectedMessagesWithEmbedsPragmaQuery)
			.all()
		const collectedMessageEmbedColumnExists = alterCollectedMessagesWithEmbedsPragmaQueryInfo.some(
			(column) => column.name === 'embeds'
		)
		if (!collectedMessageEmbedColumnExists) {
			db.prepare(alterCollectedMessagesWithEmbeds)
			db.exec(alterCollectedMessagesWithEmbeds)
		}
		db.prepare(alterQuotesSettings)
		db.exec(alterQuotesSettings)
	} catch (error) {
		console.log(error)
	}
}

createDatabase()
