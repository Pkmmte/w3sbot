import { createCommandConfig } from 'robo.js'
import {load} from 'cheerio';

export const config = createCommandConfig({
  description: 'Sends a random meme from programmerhumor.io',
} as const)

export default async (event) => {
  const requestUrl = "https://programmerhumor.io/?bimber_random_post=true";

  try {
    const response = await fetch(requestUrl);
    const $ = load(await response.text());
    const ogImage = $('meta[property="og:image"]').attr("content");
    return ogImage;
  } catch (error) {
    console.error("Error:", error.message);
  }
}
