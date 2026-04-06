<template>
  <button
    class="meal-card"
    :class="{ 'meal-card--shared': !isOwn && !isManual, 'meal-card--manual': isManual }"
    :style="cardStyle"
    type="button"
    :data-id="item.id"
    @click="$emit('tap', item)"
  >
    <span class="meal-card__name">{{ item.dish.name }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue"
import { isDishOwn } from "../utils/dishOwnership"

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(["tap"])

const isOwn = computed(() => isDishOwn(props.item.dish))
const isManual = computed(() => props.item.is_manual === true)

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const cardStyle = computed(() => {
  if (!props.item.color) return {}
  return {
    '--card-accent': props.item.color,
    '--card-bg': hexToRgba(props.item.color, 0.2),
  }
})
</script>

<style scoped>
.meal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--card-bg, var(--color-empty));
  border: none;
  border-left: 3px solid var(--card-accent, var(--color-mint));
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

.meal-card--shared {
  border-left-color: var(--card-accent, var(--color-shared-accent));
}

.meal-card--manual {
  border-left-color: var(--card-accent, var(--color-manual-meal));
  background: var(--color-manual-meal-bg);
}

.meal-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-1px);
}

.meal-card--ghost {
  opacity: 0.3;
  border: 2px dashed var(--card-accent, var(--color-mint));
  background: var(--card-bg, var(--color-empty));
}

.meal-card--chosen {
  box-shadow: var(--shadow-elevated);
  transform: scale(1.02);
  cursor: grabbing;
  transition: none;
}

.meal-card--drag {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: var(--shadow-drag);
  transition: none;
}

.sortable-fallback {
  touch-action: none;
  transition: none;
}

.meal-card__name {
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
}
</style>
