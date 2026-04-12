<template>
  <nav class="week-nav">
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('prev')">
      <IconChevronLeft />
    </button>
    <div class="week-nav__center">
      <span class="week-nav__label">{{ label }}</span>
      <button
        type="button"
        class="week-nav__shopping-btn"
        title="Список покупок на неделю"
        @click="$emit('create-shopping-week')"
      >
        <IconCartPlus :width="18" :height="18" />
      </button>
    </div>
    <button class="week-nav__btn" :disabled="disabled" @click="$emit('next')">
      <IconChevronRight />
    </button>
  </nav>
</template>

<script setup>
import IconChevronLeft from "./icons/IconChevronLeft.vue"
import IconChevronRight from "./icons/IconChevronRight.vue"
import IconCartPlus from "./icons/IconCartPlus.vue"

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

defineEmits(["prev", "next", "create-shopping-week"])
</script>

<style scoped>
.week-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
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
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.week-nav__btn:active {
  background: var(--color-border);
}

.week-nav__btn:disabled {
  opacity: 0.5;
  cursor: default;
  pointer-events: none;
}

.week-nav__center {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: center;
}

.week-nav__label {
  font-size: var(--font-lg);
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
}

.week-nav__shopping-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  border-radius: var(--radius-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--transition-fast), background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.week-nav__shopping-btn:hover {
  color: var(--color-mint);
  background: color-mix(in srgb, var(--color-mint) 10%, transparent);
}

.week-nav__shopping-btn:active {
  background: var(--color-empty);
}
</style>
