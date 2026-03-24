<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" :style="{ zIndex }" @click.self="close">
        <div class="modal-panel" @mousedown.stop @focusin="onFocusIn">
          <div class="modal-header">
            <h3 class="modal-title">{{ title }}</h3>
            <button class="modal-close" @click="close" aria-label="Закрыть">&times;</button>
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

<script setup>
import { watch, onUnmounted } from "vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: "" },
  zIndex: { type: Number, default: 1000 },
})

const emit = defineEmits(["update:modelValue"])

function close() {
  emit("update:modelValue", false)
}

function onFocusIn(e) {
  const el = e.target
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    })
  }
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
  },
)

onUnmounted(() => {
  document.body.style.overflow = savedOverflow
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow-x: hidden;
}

.modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  width: 100%;
  max-width: 420px;
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  font-size: 17px;
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
  border-radius: 8px;
  transition: background 0.15s;
}

.modal-close:hover {
  background: var(--color-empty);
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-panel,
.modal-leave-active .modal-panel {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  transform: scale(0.95);
}

.modal-leave-to .modal-panel {
  transform: scale(0.95);
}
</style>
