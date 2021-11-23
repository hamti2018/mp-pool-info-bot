'use strict'
import psList from 'ps-list'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'
import { mpapi } from '../mpapi.js'
import sendNotification from '../sendNotification.js'

const processStatus = new Composer()

setInterval(async function () {
  // eslint-disable-next-line no-eval
  if (!eval(process.env.NOTIFICATION)) return
  const { node, bakers, endors, accuser } = await getProcessStatus()
  if (!node || !bakers || !endors || !accuser) {
    const message = [
      '🆘🆘🆘🆘🆘🆘\n',
      ((node) ? '✅ ' : '❌ ') + format.bold('Node: ') + node,
      ((bakers) ? '✅ ' : '❌ ') + format.bold('Backers: ') + bakers,
      ((endors) ? '✅ ' : '❌ ') + format.bold('Endors: ') + endors,
      ((accuser) ? '✅ ' : '❌ ') + format.bold('Accuser: ') + accuser,
      '\n🆘🆘🆘🆘🆘🆘'
    ]
    await sendNotification(message.join('\n'))
  }
}, 5000)

processStatus.command('process', async ctx => {
  const { node, bakers, endors, accuser } = await getProcessStatus()

  const message = [
    ((node) ? '✅ ' : '❌ ') + format.bold('Node: ') + node,
    ((bakers) ? '✅ ' : '❌ ') + format.bold('Backers: ') + bakers,
    ((endors) ? '✅ ' : '❌ ') + format.bold('Endors: ') + endors,
    ((accuser) ? '✅ ' : '❌ ') + format.bold('Accuser: ') + accuser
  ]

  await ctx.reply(message.join('\n'), {
    parse_mode: 'MarkdownV2'
  })
})

async function getProcessStatus() {
  const processStatuses = {
    node: false,
    bakers: false,
    endors: false,
    accuser: false
  }

  try {
    await mpapi.rpc.getMineBalance(process.env.BAKER_ADDRESS)
    processStatuses.node = true
  } catch (e) {
    if (e.message.includes('ECONNREFUSED')) processStatuses.node = false
  }
  const list = await psList()
  list.forEach(l => {
    const { name } = l
    if (name.includes('mineplex-baker')) processStatuses.bakers = true
    if (name.includes('mineplex-endors')) processStatuses.endors = true
    if (name.includes('mineplex-accuse')) processStatuses.accuser = true
  })

  return processStatuses
}

export default processStatus
