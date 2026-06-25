<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" :style="{ zIndex }" @click.self="close">
        <div class="modal-panel" @mousedown.stop @focusin="onFocusIn">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" aria-label="Закрыть" @click="close">&times;</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { watch, onUnmounted } from "vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    zIndex?: number
  }>(),
  {
    title: "",
    zIndex: 1000,
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

function close() {
  emit("update:modelValue", false)
}

function onFocusIn(e: FocusEvent) {
  const el = e.target as HTMLElement
  if (el.tagName !== "INPUT" && el.tagName !== "TEXTAREA" && el.tagName !== "SELECT") return

  requestAnimationFrame(() => {
    window.scrollTo(0, 0)

    const scrollParent = el.closest(".modal-body")
    if (!scrollParent) return
    const elRect = el.getBoundingClientRect()
    const parentRect = scrollParent.getBoundingClientRect()
    const elBottom = elRect.bottom - parentRect.top
    const elTop = elRect.top - parentRect.top
    if (elBottom > scrollParent.clientHeight - 8) {
      scrollParent.scrollTop += elBottom - scrollParent.clientHeight + 16
    } else if (elTop < 0) {
      scrollParent.scrollTop += elTop - 8
    }
  })
}

let savedOverflow = ""

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = savedOverflow
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = savedOverflow
})
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  @media (min-width: 600px) {
    align-items: center;
    padding: 16px;
  }
}

.modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: var(--shadow-elevated);
  width: 100%;
  max-width: 420px;
  max-height: calc(100dvh - 32px);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;

  @media (min-width: 600px) {
    border-radius: var(--radius-md);
    margin: auto 0;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-empty);
  }
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  overscroll-behavior: contain;
}

.modal-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--transition-normal);
}

.modal-enter-active {
  .modal-panel {
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

.modal-leave-active {
  .modal-panel {
    transition: transform var(--transition-normal);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal-panel {
    transform: translateY(100%);

    @media (min-width: 600px) {
      transform: scale(0.95);
    }
  }
}
</style>
