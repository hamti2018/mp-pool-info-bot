'use strict'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'

const start = new Composer()

start.command('start', async ctx => {
  const message = [
    format.bold(format.escape('Данный бот имеет следующие команды. Параметры передаются через проблел.')),
    format.bold(format.escape('1 Баланс: /balance')),
    format.bold(format.escape('2 Доход за предыдущие циклы: /profit 413 или /profit 400-413')),
    format.bold(format.escape('3 Возможный доход от текущего цикла плюс 5: /possibleprofit 414 или  /possibleprofit 414-419')),
    format.bold(format.escape('4 Процессы : /process'))
  ]

  await ctx.reply(message.join('\n\n'), {
    parse_mode: 'MarkdownV2'
  })
})

export default start
