import { Env } from 'robo.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import Database from 'better-sqlite3';
import { CollectedMessage, CollectedMessageCategory, QuoteInstance } from '../../types/types';

Env.loadSync()

const currentDir = dirname(fileURLToPath(import.meta.url));
const dbPath = join(currentDir, '../../../../database/database.db');

const db = new Database(dbPath, {
  fileMustExist: true
});

const dbService = {
  isModuleEnabled: async (name) => {
    const query = db.prepare('SELECT * FROM Modules WHERE moduleName = ?').get(name);
    console.log(query)
    if (query.isEnabled === 1) return true;
    return false;
  },
  getAllModules: async () => {
      const query = db.prepare('SELECT * FROM Modules').all()
      return query;
  },
  setAuditLogChannel: async function(channelData) {  
    try {
      db.exec('DELETE FROM AuditLogsChannel')
      const query = db.prepare('INSERT OR REPLACE INTO AuditLogsChannel (channelName, channelId) VALUES (?, ?)');
      query.run(channelData.channelName, channelData.channelId);
      return {
        code: 200
      }
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        code: 500
      }
    }
  },
  getAuditLogChannel: async function() {
    try {
      const query = db.prepare('SELECT * FROM AuditLogsChannel LIMIT 1').get();
      return {
        code: 200,
        data: query
      }
    } catch (error) {
      return {
        code: 500
      }
    }
  },
  setMediaChannel: async function(channelData) {  
    try {
      db.exec('DELETE FROM MediaChannel')
      const query = db.prepare('INSERT OR REPLACE INTO MediaChannel (channelName, channelId) VALUES (?, ?)');
      query.run(channelData.channelName, channelData.channelId);
      return {
        code: 200,
        data: channelData
      }
    } catch (error) {
      console.error('Error executing query:', error);
      return {
        code: 500
      }
    }
  },
  getMediaChannel: async function() {
    try {
      const query = db.prepare('SELECT * FROM MediaChannel LIMIT 1').get();
      return {
        code: 200,
        data: query
      }
    } catch (error) {
      return {
        code: 500
      }
    }
  },
  collectMessage: async function(message: CollectedMessage) {
    try {
      const query = db.prepare('INSERT INTO CollectedMessages (discordUserId, discordUsername, discordMessageId, content, category, embeds) VALUES (?, ?, ?, ?, ?, ?)');
      query.run(message.discordUserId, message.discordUsername, message.discordMessageId, message.content, message.category, message.embeds);
      return {
        code: 200,
        data: query
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500
      }
    }
  },
  getCollectedMessage: async function(category?: CollectedMessageCategory) {
    try {
      let queryString = 'SELECT * FROM CollectedMessages'
      if(category) {
        queryString += `WHERE category = ${category}`;
      }
      const query = db.prepare(queryString).get();
      return {
        code: 200,
        data: query
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500
      }
    }
  },
  createQuotesInstance: async (data: QuoteInstance) => {
    try {
      const query = db.prepare('INSERT INTO QuotesSettings (channelId, category, isRunning, cronId, cronHour) VALUES (?, ?, ?, ?, ?)');
      query.run(data.channelId, data.category, data.isRunning, data.cronId, data.cronHour);
      const instance = db.prepare('SELECT * FROM QuotesSettings WHERE category = ?').get(data.category);
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
  getQuotesInstance: async (category: string) => {
    try {
      const query = db.prepare('SELECT * FROM QuotesSettings WHERE category = ?').get(category);
      return {
        code: 200,
        data: query
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
      const query = db.prepare('SELECT * FROM QuotesSettings').all();
      return {
        code: 200,
        data: query
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
      const query = db.prepare('UPDATE QuotesSettings SET isRunning = ? WHERE category = ?');
      query.run(isRunning, category);
      return {
        code: 200,
        data: query
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
      const query = db.prepare('DELETE FROM QuotesSettings WHERE category = ?');
      query.run(category);
      return {
        code: 200,
        data: query
      }
    } catch (error) {
      console.log(error)
      return {
        code: 500
      }
    }
  }
}
export default dbService;