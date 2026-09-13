// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { getScrollAdjustment, keepFieldVisible } from "./keepFieldVisible"

describe("keyboard avoidance geometry", () => {
  it("reveals a field clipped by the container even when it is inside the viewport", () => {
    expect(getScrollAdjustment({ top: 400, bottom: 440 }, { top: 100, bottom: 350 })).toBe(106)
  })

  it("does not move a visible field", () => {
    expect(getScrollAdjustment({ top: 140, bottom: 180 }, { top: 100, bottom: 350 })).toBe(0)
  })

  it("anchors oversized fields without alternating between their edges", () => {
    const visible = { top: 100, bottom: 350 }
    expect(getScrollAdjustment({ top: 400, bottom: 1000 }, visible)).toBe(284)
    expect(getScrollAdjustment({ top: 116, bottom: 716 }, visible)).toBe(0)
  })

  it("does not scroll into an empty visible area", () => {
    expect(getScrollAdjustment({ top: 400, bottom: 440 }, { top: 350, bottom: 100 })).toBe(0)
  })
})

describe("focused field layout changes", () => {
  let resize: () => void
  let viewport: EventTarget
  let disconnect: ReturnType<typeof vi.fn>
  let stop: VoidFunction | undefined

  beforeEach(() => {
    vi.useFakeTimers()
    viewport = new EventTarget()
    Object.assign(viewport, { height: 800, offsetTop: 0 })
    vi.stubGlobal("visualViewport", viewport)
    disconnect = vi.fn()
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback
        }
        observe = vi.fn()
        disconnect = disconnect
      }
    )
  })

  afterEach(() => {
    stop?.()
    stop = undefined
    document.body.replaceChildren()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function fixture(initialHeight = 600, contentHeight = 900) {
    const overlay = document.createElement("div")
    overlay.style.position = "fixed"
    const container = document.createElement("div")
    container.style.overflowY = "auto"
    const field = document.createElement("textarea")
    container.append(field)
    overlay.append(container)
    document.body.append(overlay)
    let height = initialHeight
    Object.defineProperties(container, {
      clientHeight: { get: () => height },
      scrollHeight: { get: () => contentHeight },
    })
    container.getBoundingClientRect = () => ({ top: 100, bottom: 100 + height }) as DOMRect
    field.getBoundingClientRect = () =>
      ({ top: 600 - container.scrollTop, bottom: 640 - container.scrollTop }) as DOMRect
    container.scrollTo = vi.fn((options: ScrollToOptions) => {
      container.scrollTop = Math.max(0, Math.min(contentHeight - height, options.top ?? 0))
    }) as typeof container.scrollTo
    field.focus()
    stop = keepFieldVisible(field)
    vi.advanceTimersToNextFrame()
    return { container, field, shrink: (nextHeight: number) => (height = nextHeight) }
  }

  it("corrects a delayed sheet resize after the viewport event (video regression)", () => {
    const { container, shrink } = fixture()
    viewport.dispatchEvent(new Event("resize"))
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(0)

    shrink(300)
    resize()
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(256)
  })

  it("observes containers which only become scrollable after the keyboard opens", () => {
    const { container, shrink } = fixture(600, 600)
    shrink(300)
    resize()
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(256)
  })

  it("reacts to viewport movement without a resize", () => {
    const { container } = fixture()
    Object.assign(viewport, { height: 400, offsetTop: 50 })
    viewport.dispatchEvent(new Event("scroll"))
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(206)
  })

  it("stops when no scroll room remains instead of scheduling an endless animation", () => {
    const { container, shrink } = fixture(600, 400)
    shrink(300)
    resize()
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(100)
    expect(vi.getTimerCount()).toBe(0)
  })

  it("cancels pending work and disconnects observers on cleanup", () => {
    const { container, shrink } = fixture()
    shrink(300)
    resize()
    stop?.()
    viewport.dispatchEvent(new Event("resize"))
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(0)
    expect(disconnect).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it("does not scroll a field which has lost focus", () => {
    const { container, field, shrink } = fixture()
    shrink(300)
    resize()
    field.blur()
    vi.advanceTimersToNextFrame()
    expect(container.scrollTop).toBe(0)
  })
})
