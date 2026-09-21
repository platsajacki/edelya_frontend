<template>
  <button class="ingredient-card" type="button" @click="$emit('tap', ingredient)">
    <span class="ingredient-card__main">
      <span class="ingredient-card__name">{{ ingredient.name }}</span>
      <span v-if="ingredient.category?.name" class="ingredient-card__category">
        {{ ingredient.category.name }}
      </span>
    </span>
    <span class="ingredient-card__unit">{{ UNIT_LABELS[ingredient.base_unit] }}</span>
  </button>
</template>

<script lang="ts" setup>
import type { DTOIngredient } from "@/types/ingredient"
import { UNIT_LABELS } from "../../utils/unitLabels"

defineProps<{
  ingredient: DTOIngredient
}>()

defineEmits<{
  (e: "tap", ingredient: DTOIngredient): void
}>()
</script>

<style lang="scss" scoped>
.ingredient-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition:
    box-shadow var(--transition-fast),
    border-color var(--transition-fast),
    transform var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) {
    &:hover {
      box-shadow: var(--shadow-card);
      border-color: var(--color-mint-alpha-10);
    }
  }

  &:active {
    transform: scale(var(--press-scale-sm));
  }

  &__main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
  }

  &__name {
    max-width: 100%;
    font-size: var(--font-md);
    font-weight: 700;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__category {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  &__unit {
    flex-shrink: 0;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }
}
</style>
