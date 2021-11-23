
(async () => {
  (await import('dotenv')).config()
  const bot = await import('./src/bot.js')
  bot.default.start()
})()
