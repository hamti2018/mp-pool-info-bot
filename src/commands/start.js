'use strict'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'

import { BAKER_ADDRESSES } from '../../config.js'

const start = new Composer()

start.command('start', async ctx => {
  const message = [
    format.bold(format.escape('✅ /process'))
  ]
  BAKER_ADDRESSES.reverse().forEach(baker => message.unshift(format.bold(format.escape(`💰 /balance_${baker}`))))
  await ctx.reply(message.join('\n'), {
    parse_mode: 'MarkdownV2'
  })
})

export default start
