<template>
  <nav class="week-nav">
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('prev')">
      <IconChevronLeft />
    </button>
    <span class="week-nav__label">{{ label }}</span>
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('next')">
      <IconChevronRight />
    </button>
  </nav>
</template>

<script setup>
import IconChevronLeft from "./icons/IconChevronLeft.vue"
import IconChevronRight from "./icons/IconChevronRight.vue"

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
  padding: 12px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  min-height: 52px;
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
