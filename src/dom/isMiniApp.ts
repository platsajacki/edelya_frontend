let cached: boolean | undefined

export function isMiniApp(): boolean {
  if (cached === undefined) {
    if (import.meta.env.VITE_LANDING === "1") {
      cached = false
    } else if (import.meta.env.VITE_DEBUG === "1") {
      cached = true
    } else {
      cached = Boolean(window.Telegram?.WebApp?.initData)
    }
  }

  return cached
}
