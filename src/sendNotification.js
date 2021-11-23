import { Bot } from 'grammy'

const bot = new Bot(process.env.BOT_TOKEN)

export default async function(message) {
  // eslint-disable-next-line no-eval
  for (const user of eval(process.env.ADMIN_IDS)) {
    try {
      await bot.api.sendMessage(user, message, { parse_mode: 'MarkdownV2' })
    } catch (e) {}
  }
}
