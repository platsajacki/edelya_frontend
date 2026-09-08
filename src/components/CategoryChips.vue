<template>
  <div class="category-chips">
    <button
      type="button"
      class="category-chips__chip"
      :class="{ 'category-chips__chip--active': modelValue === null }"
      @click="$emit('update:modelValue', null)"
    >
      Все
    </button>
    <button
      v-for="cat in categories"
      :key="cat.id"
      type="button"
      class="category-chips__chip"
      :class="{ 'category-chips__chip--active': modelValue === cat.id }"
      @click="$emit('update:modelValue', cat.id)"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import type { DTODishCategory } from "@/types/dish"

withDefaults(
  defineProps<{
    categories?: DTODishCategory[]
    modelValue: number | null
  }>(),
  {
    categories: () => [],
  }
)

defineEmits<{
  (e: "update:modelValue", value: number | null): void
}>()
</script>

<style lang="scss" scoped>
.category-chips {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &__chip {
    flex-shrink: 0;
    padding: 6px 14px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    white-space: nowrap;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      border-color: var(--color-mint);
    }

    &--active {
      background: var(--color-mint);
      border-color: var(--color-mint);
      color: var(--on-primary);
    }
  }
}
</style>
