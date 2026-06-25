import { onMounted, onBeforeUnmount, shallowRef, type Ref } from "vue"
import Sortable from "sortablejs"

export function useSortable(elRef: Ref<HTMLElement | null>, options: Sortable.Options) {
  const instance = shallowRef<Sortable | null>(null)

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
