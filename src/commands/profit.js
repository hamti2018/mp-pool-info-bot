'use strict'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'
import { mpapi } from '../mpapi.js'
import { getBakingRights, getEndorsingRights, getBlockCountEndorsers } from '../helpers.js'
const profit = new Composer()

profit.command('profit', async ctx => {
  if (!ctx.message?.text.split(' ')[1]) {
    return await ctx.reply('Вы забыли передать параметры.')
  }

  const cycles = ctx.message?.text
    .split(' ')[1]
    .split('-')

  cycles[0] = Number(cycles[0])
  cycles[1] = Number(cycles[1])

  if (isNaN(cycles[0]) && isNaN(cycles[1])) {
    return await ctx.reply('Параметры должны быть числами.')
  } else if (isNaN(cycles[0]) && !isNaN(cycles[1])) {
    cycles[0] = cycles[1]
  } else if (!isNaN(cycles[0]) && isNaN(cycles[1])) {
    cycles[1] = cycles[0]
  }

  const minCycles = Math.min(Number(cycles[0]), Number(cycles[1]))
  const maxCycles = Math.max(Number(cycles[0]), Number(cycles[1]))
  const currentCycle = await mpapi.rpc.getCurrentCycle()

  const { last: currentCycleLasBlock } = await mpapi.rpc.getLevelsInCurrentCycle()
  if (minCycles > currentCycle && maxCycles > currentCycle) {
    await ctx.reply('Значение должно быть мешьне текущего цикла.\nТекущий цикл: ' + currentCycle)
    return
  }

  await ctx.reply('Считаю...')

  try {
    const message = []
    const result = await calculateProfit(minCycles, maxCycles, currentCycle, currentCycleLasBlock)
    result.forEach(r => {
      message.push(
        `🔄 ${format.bold('Цикл')}: ${format.escape(r.cycle.toString())}\n` +
        `💰 ${format.bold('Доход')}: ${format.escape(r.profit.toString())}\n` +
        format.escape('--------------------------------------------\n')
      )
    })

    await ctx.reply(message.join('\n'), { parse_mode: 'MarkdownV2' })
  } catch (e) {
    console.log(e)
    await ctx.reply('Произошла ошибка при подсчете, попробуйте еще раз...')
  }
})

async function calculateProfit(minCycles, maxCycles, currentCycle, currentCycleLasBlock) {
  const result = []
  for (let i = minCycles; i <= maxCycles; i++) {
    let profitCycle = 0
    const blocks = (+currentCycleLasBlock - ((currentCycle - i) * process.env.BLOCKS_IN_CYCLE)).toString()
    const {
      baking_reward_per_endorsement: bakingRewardPerEndorsement,
      endorsement_reward: endorsementReward
    } = await mpapi.rpc.getConstants(blocks)

    const bakingRights = await getBakingRights(process.env.BAKER_ADDRESS, i, blocks)
    const endorsings = await getEndorsingRights(process.env.BAKER_ADDRESS, i, blocks)

    for (const baking of bakingRights) {
      const { level } = baking
      const head = await mpapi.rpc.getHead(level.toString())
      const countEndorsers = await getBlockCountEndorsers(head.operations)
      profitCycle += mpapi.utility.totez(bakingRewardPerEndorsement) * countEndorsers
    }

    endorsings.forEach(e => {
      profitCycle += mpapi.utility.totez(endorsementReward) * e.slots.length
    })

    result.push({
      profit: profitCycle,
      cycle: i
    })
  }

  return result
}

export default profit
