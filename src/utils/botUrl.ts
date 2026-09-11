let cached: string | undefined

export function getBotUrl(): string {
  if (cached === undefined) {
    const bot = window.__APP_CONFIG__?.telegramBot ?? import.meta.env.VITE_TELEGRAM_BOT ?? ""

    cached = bot.startsWith("http") ? bot : `https://t.me/${bot.replace(/^@/, "")}`
  }

  return cached
}
