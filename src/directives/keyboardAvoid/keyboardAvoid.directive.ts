import type { Directive } from "vue"

const SCROLL_PADDING = 16

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

const scrollFieldIntoView = (field: HTMLElement) => {
  const { top, bottom } = getVisibleRange()
  const rect = field.getBoundingClientRect()

  const delta =
    rect.bottom > bottom - SCROLL_PADDING
      ? rect.bottom - bottom + SCROLL_PADDING
      : rect.top < top + SCROLL_PADDING
        ? rect.top - top - SCROLL_PADDING
        : 0

  if (delta === 0) return

  findScrollParent(field).scrollBy({ top: delta, behavior: "smooth" })
}

const cleanups = new WeakMap<HTMLElement, VoidFunction>()

const mounted = (el: HTMLElement) => {
  const field = (el.querySelector("input,textarea") as HTMLElement | null) ?? el
  const viewport = window.visualViewport

  const handleViewportResize = () => scrollFieldIntoView(field)
  const handleFocus = () => {
    requestAnimationFrame(() => scrollFieldIntoView(field))
    viewport?.addEventListener("resize", handleViewportResize)
  }
  const handleBlur = () => viewport?.removeEventListener("resize", handleViewportResize)

  field.addEventListener("focus", handleFocus)
  field.addEventListener("blur", handleBlur)

  cleanups.set(el, () => {
    field.removeEventListener("focus", handleFocus)
    field.removeEventListener("blur", handleBlur)
    viewport?.removeEventListener("resize", handleViewportResize)
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
