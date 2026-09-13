const SCROLL_PADDING = 16
const CLIPPING_OVERFLOWS = new Set(["auto", "scroll", "hidden", "clip"])

export interface VerticalRange {
  top: number
  bottom: number
}

export function getScrollAdjustment(field: VerticalRange, visible: VerticalRange): number {
  const top = visible.top + SCROLL_PADDING
  const bottom = visible.bottom - SCROLL_PADDING
  if (bottom <= top) return 0

  // A tall textarea cannot fit both edges. Anchor its top and let its own
  // scroller keep the caret visible instead of oscillating between edges.
  if (field.bottom - field.top > bottom - top) return field.top - top
  if (field.top < top) return field.top - top
  return Math.max(0, field.bottom - bottom)
}

function getAncestors(field: HTMLElement): HTMLElement[] {
  const ancestors: HTMLElement[] = []
  let node = field.parentElement
  while (node) {
    ancestors.push(node)
    // Scrolling the document cannot reveal content inside a fixed overlay.
    if (getComputedStyle(node).position === "fixed") break
    node = node.parentElement
  }
  return ancestors
}

function getVisibleRange(ancestors: HTMLElement[]): VerticalRange {
  const viewport = window.visualViewport
  let top = viewport?.offsetTop ?? 0
  let bottom = top + (viewport?.height ?? window.innerHeight)

  for (const ancestor of ancestors) {
    if (ancestor === document.scrollingElement) continue
    if (!CLIPPING_OVERFLOWS.has(getComputedStyle(ancestor).overflowY)) continue
    const rect = ancestor.getBoundingClientRect()
    const contentTop = rect.top + ancestor.clientTop
    top = Math.max(top, contentTop)
    bottom = Math.min(bottom, contentTop + ancestor.clientHeight)
  }
  return { top, bottom }
}

function revealField(field: HTMLElement, ancestors: HTMLElement[]): void {
  for (let index = 0; index < ancestors.length; index++) {
    const parent = ancestors[index]
    const overflow = getComputedStyle(parent).overflowY
    const isRoot = parent === document.scrollingElement
    if (!isRoot && overflow !== "auto" && overflow !== "scroll") continue

    const visible = getVisibleRange(ancestors.slice(index))
    const delta = getScrollAdjustment(field.getBoundingClientRect(), visible)
    const target = Math.max(
      0,
      Math.min(parent.scrollHeight - parent.clientHeight, parent.scrollTop + delta)
    )
    if (Math.abs(target - parent.scrollTop) < 1) continue
    // Each pass uses current geometry; native smooth scrolling would leave
    // measurements stale while the keyboard and the sheet are resizing.
    parent.scrollTo({ top: target, behavior: "instant" })
  }
}

export function keepFieldVisible(field: HTMLElement): VoidFunction {
  const ancestors = getAncestors(field)
  const viewport = window.visualViewport
  let frame = 0
  let stopped = false

  const schedule = () => {
    if (stopped || frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      if (field.isConnected && document.activeElement === field) {
        revealField(field, ancestors)
      }
    })
  }

  // A WebView may resize the sheet after its viewport event. Observe layout,
  // including containers which did not overflow at the time of focus.
  const observer = new ResizeObserver(schedule)
  observer.observe(field)
  for (const ancestor of ancestors) {
    observer.observe(ancestor)
    ancestor.addEventListener("transitionend", schedule)
  }
  viewport?.addEventListener("resize", schedule)
  viewport?.addEventListener("scroll", schedule)
  window.addEventListener("resize", schedule)
  schedule()

  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    observer.disconnect()
    for (const ancestor of ancestors) ancestor.removeEventListener("transitionend", schedule)
    viewport?.removeEventListener("resize", schedule)
    viewport?.removeEventListener("scroll", schedule)
    window.removeEventListener("resize", schedule)
  }
}
