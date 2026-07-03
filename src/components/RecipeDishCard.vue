<template>
  <button class="dish-card" type="button" @click="$emit('tap', dish)">
    <span class="dish-card__name">{{ dish.name }}</span>
    <span v-if="dish.category?.name" class="dish-card__category">{{ dish.category.name }}</span>
    <div v-if="visibleIngredients.length" class="dish-card__ingredients">
      <span v-for="di in visibleIngredients" :key="di.id" class="dish-card__ingredient-chip">
        {{ di.ingredient.name }}
      </span>
      <span v-if="extraIngredientsCount > 0" class="dish-card__ingredients-more">
        +{{ extraIngredientsCount }}
      </span>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import type { DTODish } from "@/types/dish"

const props = defineProps<{
  dish: DTODish
}>()

defineEmits<{
  (e: "tap", dish: DTODish): void
}>()

const MAX_VISIBLE_INGREDIENTS = 3

const visibleIngredients = computed(
  () => props.dish.dish_ingredients?.slice(0, MAX_VISIBLE_INGREDIENTS) ?? []
)

const extraIngredientsCount = computed(() =>
  Math.max((props.dish.dish_ingredients?.length ?? 0) - MAX_VISIBLE_INGREDIENTS, 0)
)
</script>

<style lang="scss" scoped>
.dish-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  width: 100%;
  padding: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
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

  &__name {
    width: 100%;
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

  &__ingredients {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
  }

  &__ingredient-chip {
    padding: 5px 12px;
    border-radius: var(--radius-lg);
    background: var(--color-mint-alpha-10);
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--color-text);
  }

  &__ingredients-more {
    font-size: var(--font-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
  }
}
</style>
