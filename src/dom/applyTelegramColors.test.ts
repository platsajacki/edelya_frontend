// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { WebApp } from "@twa-dev/types"
import { applyTelegramColors } from "./applyTelegramColors"

function isAtLeast(current: string, required: string): boolean {
  const a = current.split(".").map(Number)
  const b = required.split(".").map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0)
    if (diff !== 0) return diff > 0
  }
  return true
}

function createWebApp(version: string) {
  return {
    isVersionAtLeast: (required: string) => isAtLeast(version, required),
    setHeaderColor: vi.fn(),
    setBackgroundColor: vi.fn(),
    setBottomBarColor: vi.fn(),
  }
}

describe("applyTelegramColors", () => {
  let style: HTMLStyleElement

  beforeEach(() => {
    style = document.createElement("style")
    style.textContent = ":root { --color-bg: #f8f7f3; --color-surface: #ffffff; }"
    document.head.append(style)
  })

  afterEach(() => {
    style.remove()
  })

  it("paints header, background and bottom bar with app tokens", () => {
    const tg = createWebApp("8.0")
    applyTelegramColors(tg as unknown as WebApp)

    expect(tg.setHeaderColor).toHaveBeenCalledWith("#f8f7f3")
    expect(tg.setBackgroundColor).toHaveBeenCalledWith("#f8f7f3")
    expect(tg.setBottomBarColor).toHaveBeenCalledWith("#ffffff")
  })

  it("skips bottom bar before 7.10", () => {
    const tg = createWebApp("7.9")
    applyTelegramColors(tg as unknown as WebApp)

    expect(tg.setHeaderColor).toHaveBeenCalledWith("#f8f7f3")
    expect(tg.setBottomBarColor).not.toHaveBeenCalled()
  })

  it("does not pass hex colors to clients that only accept theme keys", () => {
    const tg = createWebApp("6.8")
    applyTelegramColors(tg as unknown as WebApp)

    expect(tg.setHeaderColor).not.toHaveBeenCalled()
    expect(tg.setBackgroundColor).not.toHaveBeenCalled()
    expect(tg.setBottomBarColor).not.toHaveBeenCalled()
  })

  it("does nothing when tokens are not plain hex colors", () => {
    style.textContent = ":root { --color-bg: var(--missing); --color-surface: rgb(255 255 255); }"
    const tg = createWebApp("8.0")
    applyTelegramColors(tg as unknown as WebApp)

    expect(tg.setHeaderColor).not.toHaveBeenCalled()
    expect(tg.setBottomBarColor).not.toHaveBeenCalled()
  })
})
