'use strict'
import psList from 'ps-list'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'

import { BAKER_NAMES, NOTIFICATION } from '../../config.js'
import { mpapi } from '../mpapi.js'
import sendNotification from '../sendNotification.js'

const processStatus = new Composer()

if (NOTIFICATION) {
  setInterval(async function () {
    const { node, bakers, endors, accuser } = await getProcessStatus()
    if (!node || Object.values(bakers).includes(false) || !endors || !accuser) {
      const message = [
        '🆘🆘🆘🆘🆘🆘\n',
        ((node) ? '✅ ' : '❌ ') + format.bold('Node: ') + node,
        ((endors) ? '✅ ' : '❌ ') + format.bold('Endors: ') + endors,
        ((accuser) ? '✅ ' : '❌ ') + format.bold('Accuser: ') + accuser,
        '\n🆘🆘🆘🆘🆘🆘'
      ]

      for (const [key, value] of Object.entries(bakers)) {
        message.push(((value) ? '✅ ' : '❌ ') + format.bold(`Backer ${key}: `) + value)
      }
      await sendNotification(message.join('\n'))
    }
  }, 30000)
}

processStatus.command('process', async ctx => {
  const { node, bakers, endors, accuser } = await getProcessStatus()
  const message = [
    ((node) ? '✅ ' : '❌ ') + format.bold('Node: ') + node,
    ((endors) ? '✅ ' : '❌ ') + format.bold('Endors: ') + endors,
    ((accuser) ? '✅ ' : '❌ ') + format.bold('Accuser: ') + accuser
  ]

  for (const [key, value] of Object.entries(bakers)) {
    message.push(((value) ? '✅ ' : '❌ ') + format.bold(`Backer ${key}: `) + value)
  }

  await ctx.reply(message.join('\n'), {
    parse_mode: 'MarkdownV2'
  })
})

async function getProcessStatus() {
  const processStatuses = {
    node: false,
    bakers: {},
    endors: false,
    accuser: false
  }

  BAKER_NAMES.forEach(name => {
    processStatuses.bakers[name] = false
  })

  try {
    await mpapi.rpc.getMineBalance(process.env.BAKER_ADDRESS)
    processStatuses.node = true
  } catch (e) {
    if (e.message.includes('ECONNREFUSED')) processStatuses.node = false
  }
  const list = await psList()
  list.forEach(l => {
    const { name, cmd } = l
    if (name.includes('mineplex-baker')) {
      BAKER_NAMES.forEach(e => {
        if (cmd.includes(e)) processStatuses.bakers[e] = true
      })
    }
    if (name.includes('mineplex-endors')) processStatuses.endors = true
    if (name.includes('mineplex-accuse')) processStatuses.accuser = true
  })

  return processStatuses
}

export default processStatus
