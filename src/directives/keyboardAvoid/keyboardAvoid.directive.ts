import type { ObjectDirective } from "vue"
import { keepFieldVisible } from "./keepFieldVisible"

const roots = new WeakMap<HTMLElement, VoidFunction>()
const FIELD_SELECTOR = "input, textarea, select, [contenteditable='true']"

function findOwner(field: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = field
  while (node) {
    if (roots.has(node)) return node
    node = node.parentElement
  }
  return null
}

function mounted(root: HTMLElement): void {
  let stop: VoidFunction | undefined

  const handleBlur = () => {
    stop?.()
    stop = undefined
  }
  const handleFocus = () => {
    const field = document.activeElement
    if (!(field instanceof HTMLElement) || !field.matches(FIELD_SELECTOR)) return
    if (findOwner(field) !== root) return
    handleBlur()
    stop = keepFieldVisible(field)
  }

  roots.set(root, () => {
    handleBlur()
    root.removeEventListener("focusin", handleFocus)
    root.removeEventListener("focusout", handleBlur)
  })
  root.addEventListener("focusin", handleFocus)
  root.addEventListener("focusout", handleBlur)
  handleFocus()
}

export const KeyboardAvoidDirective: ObjectDirective<HTMLElement> = {
  mounted,
  unmounted(root) {
    roots.get(root)?.()
    roots.delete(root)
  },
}
