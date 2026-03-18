import { onMounted, onBeforeUnmount, shallowRef } from "vue"
import Sortable from "sortablejs"

export function useSortable(elRef, options) {
  const instance = shallowRef(null)

  onMounted(() => {
    if (elRef.value) {
      instance.value = Sortable.create(elRef.value, options)
    }
  })

  onBeforeUnmount(() => {
    if (instance.value) {
      instance.value.destroy()
      instance.value = null
    }
  })

  return instance
}
