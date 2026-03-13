<template>
  <nav class="week-nav">
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('prev')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <span class="week-nav__label">{{ label }}</span>
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('next')">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </nav>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

defineEmits(["prev", "next"])
</script>

<style scoped>
.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-height: 56px;
}

.week-nav__btn {
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}

.week-nav__btn:active {
  background: var(--color-border);
}

.week-nav__btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.week-nav__label {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
}
</style>
