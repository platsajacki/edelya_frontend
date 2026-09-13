import type { Directive } from "vue"
import { prefersReducedMotion } from "@/dom/prefersReducedMotion"

const SCROLL_PADDING = 16
const FOLLOW_TIME_CONSTANT_MS = 50
const FRAME_MS = 1000 / 60

const findScrollParent = (el: HTMLElement): Element => {
  let node = el.parentElement

  while (node) {
    const overflowY = getComputedStyle(node).overflowY

    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
      return node
    }

    node = node.parentElement
  }

  return document.scrollingElement ?? document.documentElement
}

const getVisibleRange = () => {
  const viewport = window.visualViewport

  return viewport
    ? { top: viewport.offsetTop, bottom: viewport.offsetTop + viewport.height }
    : { top: 0, bottom: window.innerHeight }
}

const getOverflowDelta = (field: HTMLElement) => {
  const { top, bottom } = getVisibleRange()
  const rect = field.getBoundingClientRect()

  return rect.bottom > bottom - SCROLL_PADDING
    ? rect.bottom - bottom + SCROLL_PADDING
    : rect.top < top + SCROLL_PADDING
      ? rect.top - top - SCROLL_PADDING
      : 0
}

const createFieldFollower = (field: HTMLElement) => {
  let frame = 0
  let lastTime = 0

  const step = (time: number) => {
    const delta = getOverflowDelta(field)

    if (Math.abs(delta) < 1) {
      frame = 0
      return
    }

    const elapsed = lastTime ? time - lastTime : FRAME_MS
    lastTime = time

    const progress = prefersReducedMotion() ? 1 : 1 - Math.exp(-elapsed / FOLLOW_TIME_CONSTANT_MS)
    const distance = Math.sign(delta) * Math.max(1, Math.round(Math.abs(delta) * progress))
    const scrollParent = findScrollParent(field)
    const scrollTopBefore = scrollParent.scrollTop

    scrollParent.scrollBy({ top: distance, behavior: "instant" })

    if (scrollParent.scrollTop === scrollTopBefore) {
      frame = 0
      return
    }

    frame = requestAnimationFrame(step)
  }

  const start = () => {
    if (frame) return

    lastTime = 0
    frame = requestAnimationFrame(step)
  }

  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }

  return { start, stop }
}

const cleanups = new WeakMap<HTMLElement, VoidFunction>()

const mounted = (el: HTMLElement) => {
  const field = (el.querySelector("input,textarea") as HTMLElement | null) ?? el
  const viewport = window.visualViewport
  const follower = createFieldFollower(field)

  const handleFocus = () => {
    follower.start()
    viewport?.addEventListener("resize", follower.start)
  }
  const handleBlur = () => {
    follower.stop()
    viewport?.removeEventListener("resize", follower.start)
  }

  field.addEventListener("focus", handleFocus)
  field.addEventListener("blur", handleBlur)

  cleanups.set(el, () => {
    field.removeEventListener("focus", handleFocus)
    field.removeEventListener("blur", handleBlur)
    handleBlur()
  })
}

const unmounted = (el: HTMLElement) => {
  cleanups.get(el)?.()
  cleanups.delete(el)
}

export const KeyboardAvoidDirective: Directive<HTMLElement> = {
  mounted,
  unmounted,
}
