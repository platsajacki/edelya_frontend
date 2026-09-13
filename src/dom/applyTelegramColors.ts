import type { WebApp } from "@twa-dev/types"

type HexColor = `#${string}`

function isHexColor(value: string): value is HexColor {
  return /^#[0-9a-f]{6}$/i.test(value)
}

function readColorToken(name: string): HexColor | null {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return isHexColor(value) ? value : null
}

export function applyTelegramColors(tg: WebApp): void {
  const bg = readColorToken("--color-bg")
  const surface = readColorToken("--color-surface")

  if (bg && tg.isVersionAtLeast("6.9")) {
    tg.setHeaderColor(bg)
    tg.setBackgroundColor(bg)
  }

  if (surface && tg.isVersionAtLeast("7.10")) {
    tg.setBottomBarColor(surface)
  }
}
