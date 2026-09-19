import { onBeforeUpdate, onUpdated, type Ref } from "vue"
import { prefersReducedMotion } from "@/dom/prefersReducedMotion"

const FLIP_DURATION_MS = 200

export function useFlipOnUpdate(target: Readonly<Ref<HTMLElement | null>>) {
  let before: DOMRect | null = null
  onBeforeUpdate(() => {
    before = target.value?.getBoundingClientRect() ?? null
  })
  onUpdated(() => {
    const el = target.value
    if (!el || !before || prefersReducedMotion()) return
    const after = el.getBoundingClientRect()
    const dx = before.left - after.left
    const dy = before.top - after.top
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
      duration: FLIP_DURATION_MS,
      easing: "ease",
    })
  })
}
