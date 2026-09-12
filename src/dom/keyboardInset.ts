const CSS_VAR = "--keyboard-inset"
const MIN_INSET_PX = 24
const MAX_SCALE = 1.01

function apply(value: number): void {
  document.documentElement.style.setProperty(CSS_VAR, `${value}px`)
}

export function setupKeyboardInset(): void {
  const viewport = window.visualViewport
  if (!viewport) return

  let frame = 0

  const sync = () => {
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      if (viewport.scale > MAX_SCALE) {
        apply(0)
        return
      }
      const inset = window.innerHeight - viewport.height - viewport.offsetTop
      apply(inset >= MIN_INSET_PX ? Math.round(inset) : 0)
    })
  }

  viewport.addEventListener("resize", sync)
  viewport.addEventListener("scroll", sync)
  sync()
}
