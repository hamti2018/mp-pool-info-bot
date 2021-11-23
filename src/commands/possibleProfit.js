'use strict'
import { Composer } from 'grammy'
import { markdownv2 as format } from 'telegram-format'
import { getBakingRights, getEndorsingRights } from '../helpers.js'
import { mpapi } from '../mpapi.js'
const possibleProfit = new Composer()

possibleProfit.command('possibleprofit', async ctx => {
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
  if ((minCycles < currentCycle && maxCycles < currentCycle) ||
    maxCycles > currentCycle + 5) {
    await ctx.reply(`Значение должно быть больше (не более ${currentCycle + 5}) или равно текущему циклу.\n` +
      'Текущий цикл: ' + currentCycle)
    return
  }

  await ctx.reply('Считаю...')

  try {
    const message = []
    const result = await calculateProfit(minCycles, maxCycles, currentCycle, currentCycleLasBlock)
    result.forEach(r => {
      message.push(
        `🔄 ${format.bold('Цикл')}: ${format.escape(r.cycle.toString())}\n` +
        `💰 ${format.bold('Возможный доход')}: ${format.escape(r.profit.toString())}\n` +
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
    const bakingRights = await getBakingRights(process.env.BAKER_ADDRESS, i)
    const endorsings = await getEndorsingRights(process.env.BAKER_ADDRESS, i)
    profitCycle += bakingRights.length * 75
    endorsings.forEach(e => {
      profitCycle += 2.5 * e.slots.length
    })
    result.push({
      profit: profitCycle,
      cycle: i
    })
  }

  return result
}

export default possibleProfit
