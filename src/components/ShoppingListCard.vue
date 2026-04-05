<template>
  <button class="shopping-card" type="button" @click="$emit('tap', list)">
    <div class="shopping-card__main">
      <span class="shopping-card__name">{{ list.name }}</span>
      <span class="shopping-card__dates">{{ dateRange }}</span>
    </div>
    <IconChevronRight class="shopping-card__chevron" />
  </button>
</template>

<script setup>
import { computed } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import IconChevronRight from "./icons/IconChevronRight.vue"

const props = defineProps({
  list: { type: Object, required: true },
})

defineEmits(["tap"])

const dateRange = computed(() => {
  const from = formatYMDtoDDMMYYYY(props.list.date_from)
  const to = formatYMDtoDDMMYYYY(props.list.date_to)
  return `${from} – ${to}`
})
</script>

<style scoped>
.shopping-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.shopping-card:active {
  background: var(--color-empty);
}

.shopping-card__main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.shopping-card__name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shopping-card__dates {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.shopping-card__chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  opacity: 0.5;
}
</style>
