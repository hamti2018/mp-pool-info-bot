import { Bot } from 'grammy'

import { ADMIN_IDS } from '../config.js'

const bot = new Bot(process.env.BOT_TOKEN)

export default async function(message) {
  for (const user of ADMIN_IDS) {
    try {
      await bot.api.sendMessage(user, message, { parse_mode: 'MarkdownV2' })
    } catch (e) {}
  }
}
