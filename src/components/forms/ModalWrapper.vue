<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        :style="{ zIndex, ...viewportStyle }"
        @click.self="close"
      >
        <div
          class="modal-panel"
          :class="{ 'modal-panel--no-footer': !$slots.footer }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @mousedown.stop
        >
          <div class="modal-header">
            <h2 :id="titleId" class="modal-title">{{ title }}</h2>
            <button class="modal-close" aria-label="Закрыть" @click="close">
              <IconClose />
            </button>
          </div>
          <div v-keyboard-avoid class="modal-body">
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
import { watch, onUnmounted, useId } from "vue"
import IconClose from "@/components/icons/IconClose.vue"
import { useModalBackButton } from "@/composables/useModalBackButton"
import { useVisibleViewport } from "@/composables/useVisibleViewport"
import { KeyboardAvoidDirective as vKeyboardAvoid } from "@/directives/keyboardAvoid"

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

const titleId = useId()
const viewportStyle = useVisibleViewport(() => props.modelValue)

function close() {
  emit("update:modelValue", false)
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

useModalBackButton(() => props.modelValue, close)
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  left: 0;
  right: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: var(--sheet-inset-top) 0 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;

  @media (min-width: 600px) {
    align-items: center;
    padding: var(--sheet-inset-top) 16px 16px;
  }
}

.modal-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: var(--shadow-elevated);
  width: 100%;
  max-width: 420px;
  max-height: 100%;
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

  @media (hover: hover) {
    &:hover {
      background: var(--color-empty);
    }
  }
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  overscroll-behavior: contain;

  .modal-panel--no-footer & {
    padding-bottom: calc(16px + var(--safe-area-bottom));
  }
}

.modal-footer {
  padding: 12px 20px calc(16px + var(--safe-area-bottom));
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
