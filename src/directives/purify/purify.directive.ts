import dompurify from "isomorphic-dompurify"
import { type Directive, type DirectiveBinding } from "vue"

function updated(el: HTMLElement, binding: DirectiveBinding<string>) {
  const current = binding.value

  if (current === binding.oldValue) {
    return
  }

  el.innerHTML = dompurify.sanitize(`${current}`)
}

function getSSRProps(binding: DirectiveBinding<string>) {
  const current = binding.value

  return {
    innerHTML: dompurify.sanitize(`${current}`),
  }
}

export const vPurify: Directive<HTMLElement, string> = {
  mounted: updated,
  updated,
  getSSRProps,
}
