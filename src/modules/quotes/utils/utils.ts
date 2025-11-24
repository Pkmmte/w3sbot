import { ToadScheduler, Task, CronJob, SimpleIntervalJob } from 'toad-scheduler';
import dbService from '../../../db/service/index.js';
import { QuoteInstance } from '../../../types/types.js';
import {quotes} from '../data/quotes.js';
// @ts-ignore
import { posted_quotes } from '../../../../../statics/posted-quotes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { QuoteCategory, Quote } from '../../../types/types.js';
import { AttachmentBuilder, Colors, EmbedBuilder } from 'discord.js';
import { Logger } from 'robo.js';

const logger = new Logger();

const scheduler = new ToadScheduler();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const attachmentsPath = path.join(__dirname, '../../../assets/');

const switchEmbedColors = (category: QuoteCategory) => {
  switch (category) {
    case QuoteCategory.Funny:
      return Colors.Gold;
    case QuoteCategory.Inspirational:
      return Colors.Green;
    case QuoteCategory.Programming:
      return Colors.DarkAqua;
  }
}

const switchEmbedAttachment = (category: QuoteCategory) => {
  switch (category) {
    case QuoteCategory.Funny:
      return 'daily-funny-image';
    case QuoteCategory.Inspirational:
      return 'daily-inspirational-image';
    case QuoteCategory.Programming:
      return 'daily-programming-image';
  }
}

const createQuotesEmbedMessage = async (category: QuoteCategory, quote: Quote) => {
  const quoteEmbed = new EmbedBuilder();

	if (quote.author) {
    quoteEmbed.setAuthor({ name: `${quote.author}`});
  }
	quoteEmbed
  .setImage(`attachment://${switchEmbedAttachment(category)}.png`)
	.addFields(
		{ name: '\n', value: '```yaml\n' + quote.text + '\n```'}
	)
  .setColor(switchEmbedColors(category));

  return quoteEmbed;
}

const getRandomFunnyQuote = async (): Promise<Quote> => {
  try {
    const response = await fetch("https://quotes.rest/qod?category=funny&language=en", {
      headers: {
        "Content-Type": "application/json",
        "X-TheySaidSo-Api-Secret": `${process.env.THEY_SAID_SO_API_KEY}`,
        "Authorization": `Bearer ${process.env.THEY_SAID_SO_API_KEY}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch funny quote: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    const data = (json as any).contents.quotes[0];
    return {
      author: data.author,
      text: data.quote
    };
  } catch (error) {
    logger.error(`getRandomFunnyQuote -> error`);
    logger.error(error);
    throw error;
  }
}

export const getInpirationalQuoteOfTheDay = async (): Promise<Quote> => {
  try {
    const response = await fetch("https://quotes.rest/qod?category=inspire&language=en", {
      headers: {
        "Content-Type": "application/json",
        "X-TheySaidSo-Api-Secret": `${process.env.THEY_SAID_SO_API_KEY}`,
        "Authorization": `Bearer ${process.env.THEY_SAID_SO_API_KEY}`,
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch inspirational quote: ${response.status} ${response.statusText}`);
    }
    const json = await response.json();
    const data = (json as any).contents.quotes[0];
    return {
      author: data.author,
      text: data.quote
    };
  } catch (error) {
    logger.error(`getInpirationalQuoteOfTheDay -> error`);
    logger.error(error);
    throw error;
  }
}

const getRandomProgrammingQuote = async (): Promise<Quote> => {
  let availableQuotes = quotes.filter(quote => !posted_quotes.includes(quote.id));
  const postedQuotesFilePath = path.join(__dirname, '../../../../../statics/posted-quotes.js');
  // If there is no quotes left to post, reset posted quotes
  if (availableQuotes.length === 0) {
    console.log('No quotes left to post, resetting posted quotes')
    fs.writeFileSync(postedQuotesFilePath, `export const posted_quotes = ${JSON.stringify([], null, 2)};`);
    availableQuotes = quotes;
  }

  const randomIndex = Math.floor(Math.random() * availableQuotes.length);
  const selectedQuote = availableQuotes[randomIndex];

  posted_quotes.push(selectedQuote.id);
  fs.writeFileSync(postedQuotesFilePath, `export const posted_quotes = ${JSON.stringify(posted_quotes, null, 2)};`);

  return {
    id: selectedQuote.id,
    author: selectedQuote.author,
    text: selectedQuote.en
  };
}

export const createOrStartQuotesJob = async (data: QuoteInstance, event: any, startEvent?: any) => {
  const switchQuotesJob = async (category: QuoteCategory) => {
    switch (category) {
      case QuoteCategory.Funny:
        return await getRandomFunnyQuote();
      case QuoteCategory.Inspirational:
        return await getInpirationalQuoteOfTheDay();
      case QuoteCategory.Programming:
        return await getRandomProgrammingQuote();
    }
  }

  try {
    const task = new Task(
      `${data.category}-task`, async () => {
        const d = data;
        let instance = (await dbService.getQuotesInstance(d.category)).data;
        if (!instance) {
         instance = (await dbService.createQuotesInstance(d)).data;
        }

        const filePath = path.join(attachmentsPath, `${switchEmbedAttachment(data.category)}.png`);
        const file = new AttachmentBuilder(filePath, {
          name: `${switchEmbedAttachment(data.category)}.png`
        });
        let channel;
        if (event) {
          channel = await event.member.guild.channels.cache.get(instance.channelId);
          console.log('Event provided')
        } else if (startEvent) {
          channel = await startEvent.channels.cache.get(data.channelId);
          console.log('Start event provided')
        }
        const quote = await switchQuotesJob(d.category);
        const embed = await createQuotesEmbedMessage(d.category, quote);
        await channel.send({ embeds: [embed], files: [file] });
      });

      // const job = new SimpleIntervalJob(
      //   { seconds: 15, runImmediately: true },
      //   task,
      //   {id: data.category}
      // );
      // scheduler.addSimpleIntervalJob(job);
      const job = new CronJob({
        cronExpression: `0 ${data.cronHour} * * *`,
      }, task, {id: data.category});
      scheduler.addCronJob(job);
      return true;

  } catch (error) {
    logger.error(`createOrStartQuotesJob -> error`);
    logger.error(error)
    return false
  }

}

export const restartExistingCronInstances = async (startEvent) => {
  const instances = await dbService.getAllQuotesInstances();
  if (instances.data && instances.data.length > 0) {
    instances.data.forEach(async (instance: QuoteInstance) => {
      try {
        await createOrStartQuotesJob(instance, null, startEvent);
        const channel = await startEvent.channels.cache.get(`${process.env.DISCORD_DEBUG_CHANNEL_ID}`);
        if (channel) {
          await channel.send(`Quotes instance for category ${instance.category} started`);
        }
      } catch (error) {
        logger.error(`restartExistingCronInstances -> error`);
        logger.error(error)
        const channel = await startEvent.channels.cache.get(`${process.env.DISCORD_DEBUG_CHANNEL_ID}`);
        if (channel) {
          await channel.send(error);
        }
      }
    })
  }
}

export const stopAndDeleteQuotesJob = async (category: string) => {
  try {
    let instance = await dbService.getQuotesInstance(category);
    if (instance.data) {
     await dbService.deleteQuotesInstance(category);
     scheduler.stopById(category);
     scheduler.removeById(category);
     logger.info(`Quotes instance for category ${category} stopped`);
    }
  } catch (error) {
    logger.error(`stopAndDeleteQuotesJob -> error`);
    logger.error(error)
  }
}
