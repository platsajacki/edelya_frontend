import { shallowRef, watch } from "vue"

function measureViewport() {
  const viewport = window.visualViewport
  return {
    top: `${viewport?.offsetTop ?? 0}px`,
    height: `${viewport?.height ?? window.innerHeight}px`,
  }
}

export function useVisibleViewport(isOpen: () => boolean) {
  const style = shallowRef(measureViewport())

  watch(
    isOpen,
    (open, _, onCleanup) => {
      if (!open) return
      const viewport = window.visualViewport
      let frame = 0
      const update = () => {
        if (frame) return
        frame = requestAnimationFrame(() => {
          frame = 0
          style.value = measureViewport()
        })
      }
      style.value = measureViewport()
      viewport?.addEventListener("resize", update)
      viewport?.addEventListener("scroll", update)
      window.addEventListener("resize", update)

      onCleanup(() => {
        cancelAnimationFrame(frame)
        viewport?.removeEventListener("resize", update)
        viewport?.removeEventListener("scroll", update)
        window.removeEventListener("resize", update)
      })
    },
    { immediate: true }
  )

  return style
}
