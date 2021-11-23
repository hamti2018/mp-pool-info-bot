'use strict'

import { Bot } from 'grammy'
import { apiThrottler } from '@grammyjs/transformer-throttler'

import commands from './commands/index.js'

const throttler = apiThrottler()

const bot = new Bot(process.env.BOT_TOKEN)

bot.api.config.use(throttler)
bot.filter(ctx => filter(ctx))
bot.use(...commands)

async function filter(ctx) {
  const id = ctx.from?.id
  // eslint-disable-next-line no-eval
  if (eval(process.env.ADMIN_IDS).includes(id)) {
    return true
  }

  await ctx.reply('Вы не админ')
  return false
}

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot
