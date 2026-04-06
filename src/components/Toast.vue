<template>
  <Transition name="toast">
    <div v-if="message" class="toast" @click="$emit('dismiss')">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
defineProps({ message: { type: String, default: '' } })
defineEmits(['dismiss'])
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  box-shadow: var(--shadow-elevated);
  cursor: pointer;
  z-index: var(--z-toast);
  max-width: calc(100vw - 32px);
  text-align: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
