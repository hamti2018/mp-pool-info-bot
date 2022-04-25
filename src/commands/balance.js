'use strict'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'
import { mpapi } from '../mpapi.js'
const { utility } = mpapi

const balance = new Composer()

balance.hears(/\/balance_mp1*(.+)?/, async ctx => {
  const bakerAddress = ctx.message.text.split('_')[1]
  const {
    balance,
    frozen_balance: frozenBalance,
    staking_balance: stakingBalance,
    delegated_balance: delegatedBalance,
    delegated_contracts: delegatedContracts,
    deactivated
  } = await mpapi.rpc.getDelegateInfo(bakerAddress)
  const message = [
    format.bold('💰 Баланс пула: ') + utility.totez(balance).toFixed(0) + format.escape(` - [${div(utility.totez(balance))}MM]`),
    format.bold('👑 Стейкнули: ') + utility.totez(delegatedBalance).toFixed(0) + format.escape(` - [${div(utility.totez(delegatedBalance))}MM]`),
    format.bold('⭕️ Общий стейк: ') + utility.totez(stakingBalance).toFixed(0) + format.escape(` - [${div(utility.totez(stakingBalance))}MM]`),
    format.bold('📛 Замороженый баланс: ') + utility.totez(frozenBalance).toFixed(0),
    format.bold('👍 Колличество делегатов: ') + delegatedContracts.length,
    format.bold('✅ Статус пула: ') + !deactivated
  ]

  await ctx.reply(message.join('\n'), {
    parse_mode: 'MarkdownV2'
  })
})

function div(val, by = 1000000) {
  return (val - val % by) / by
}

export default balance
