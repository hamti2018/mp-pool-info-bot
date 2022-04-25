'use strict'

import { Bot } from 'grammy'
import { apiThrottler } from '@grammyjs/transformer-throttler'

import { ADMIN_IDS } from '../config.js'
import commands from './commands/index.js'

const throttler = apiThrottler()

const bot = new Bot(process.env.BOT_TOKEN)

bot.api.config.use(throttler)
bot.use(async (ctx, next) => {
  const id = ctx.from?.id
  if (ADMIN_IDS.includes(id)) {
    await next()
    return
  }
  await ctx.reply('No access')
})

bot.use(...commands)
bot.catch((err) => {
  const ctx = err.ctx
  console.error(`Error while handling update ${ctx.update.update_id}: ${err}`)
})

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot
