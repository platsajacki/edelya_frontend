import { ref } from "vue"

export function useDevOpened() {
  const opened = ref<string | null>(null)
  function closeOn(value: boolean) {
    if (!value) opened.value = null
  }
  return { opened, closeOn }
}
