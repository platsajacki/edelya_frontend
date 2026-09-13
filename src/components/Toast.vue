<template>
  <div class="toast-region" role="status" aria-live="polite">
    <Transition name="toast">
      <div v-if="message" class="toast" @click="$emit('dismiss')">
        {{ message }}
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: "",
  }
)

defineEmits<{
  (e: "dismiss"): void
}>()
</script>

<style lang="scss" scoped>
.toast-region {
  position: fixed;
  bottom: calc(var(--nav-height) + 20px);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-toast);
  max-width: calc(100vw - 32px);
  pointer-events: none;
}

.toast {
  padding: 12px 20px;
  background: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  box-shadow: var(--shadow-elevated);
  cursor: pointer;
  text-align: center;
  pointer-events: auto;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
