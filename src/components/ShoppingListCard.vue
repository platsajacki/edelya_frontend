<template>
  <button class="shopping-card" type="button" @click="$emit('tap', list)">
    <div class="shopping-card__main">
      <span class="shopping-card__name">{{ list.name }}</span>
      <span class="shopping-card__dates">{{ dateRange }}</span>
    </div>
    <IconChevronRight class="shopping-card__chevron" />
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import IconChevronRight from "./icons/IconChevronRight.vue"
import type { DTOShoppingList } from "@/types/shopping"

const props = defineProps<{
  list: DTOShoppingList
}>()

defineEmits<{
  (e: "tap", list: DTOShoppingList): void
}>()

const dateRange = computed(() => {
  const from = formatYMDtoDDMMYYYY(props.list.date_from)
  const to = formatYMDtoDDMMYYYY(props.list.date_to)
  return `${from} – ${to}`
})
</script>

<style lang="scss" scoped>
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
  transition:
    background var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  &:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-mint-alpha-10);
  }

  &:active {
    transform: scale(var(--press-scale-sm));
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__dates {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__chevron {
    flex-shrink: 0;
    color: var(--color-text-secondary);
    opacity: 0.5;
  }
}
</style>
