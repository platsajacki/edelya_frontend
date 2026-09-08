import type { Directive } from "vue"
import { isIOS } from "@/dom/isMobile.ts"

const TEXTFIELD_ATTRS = [
  `type`,
  `inputMode`,
  `autocomplete`,
  `accept`,
  `min`,
  `max`,
  `step`,
  `pattern`,
  `size`,
  `maxlength`,
] as const

const patchFakeInputFromTrueInput = (fakeInput: HTMLElement, trueInput: HTMLElement) => {
  TEXTFIELD_ATTRS.forEach((attr) => {
    const value = trueInput.getAttribute(attr)

    if (value !== null && value !== undefined) {
      fakeInput.setAttribute(attr, value)
    }
  })
}

const makeFakeInput = (el: HTMLElement) => {
  const fakeInput = document.createElement("input")
  const rect = el.getBoundingClientRect()

  patchFakeInputFromTrueInput(fakeInput, el)

  fakeInput.setAttribute("autofocus", "autofocus")
  fakeInput.style.height = `${rect.height}px`
  fakeInput.style.width = `${rect.width / 2}px`
  fakeInput.style.position = "fixed"
  fakeInput.style.zIndex = `-99999999`
  fakeInput.style.caretColor = `transparent`
  fakeInput.style.border = `none`
  fakeInput.style.outline = `none`
  fakeInput.style.color = `transparent`
  fakeInput.style.background = `transparent`
  fakeInput.style.cursor = `none`
  fakeInput.style.fontSize = `16px`
  fakeInput.style.top = `${rect.top}px`
  fakeInput.style.left = `${rect.left}px`

  return fakeInput
}

const focusOnIos = (el: HTMLElement, select: boolean) => {
  const fakeInput = makeFakeInput(el)
  const duration = 100

  let fakeFocusTimeout: ReturnType<typeof setTimeout> | null = null
  let elementFocusTimeout: ReturnType<typeof setTimeout> | null = null

  const blurHandler = () => fakeInput.focus({ preventScroll: true })
  const focusHandler = () => {
    fakeFocusTimeout && clearTimeout(fakeFocusTimeout)

    fakeFocusTimeout = setTimeout(() => {
      elementFocusTimeout && clearTimeout(elementFocusTimeout)

      fakeInput.removeEventListener("blur", blurHandler)
      fakeInput.removeEventListener("focus", focusHandler)

      elementFocusTimeout = setTimeout(() => {
        el.focus({ preventScroll: false })
        if (select) (el as HTMLInputElement).select()
        fakeInput.remove()
      }, duration)
    })
  }

  fakeInput.addEventListener("blur", blurHandler, { once: true })
  fakeInput.addEventListener("focus", focusHandler)

  el.parentElement?.appendChild(fakeInput)

  fakeInput.focus({ preventScroll: true })
}

const mounted = (
  el: HTMLElement,
  binding: { modifiers: Record<string, boolean>; value: boolean }
) => {
  if (binding.value === false) {
    return
  }

  const select = !!binding.modifiers.select

  Promise.resolve().then(() => {
    const _el = (el.querySelector("input,textarea") as HTMLElement | null) ?? el

    if (isIOS()) {
      focusOnIos(_el, select)
    } else {
      setTimeout(() => {
        _el.focus()
        if (select) (_el as HTMLInputElement).select()
      })
    }
  })
}

export const AutoFocusDirective: Directive<HTMLElement, boolean> = {
  mounted,
}
