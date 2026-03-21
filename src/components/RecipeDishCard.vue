<template>
  <button class="dish-card" type="button" @click="$emit('tap', dish)">
    <div class="dish-card__main">
      <span class="dish-card__name">{{ dish.name }}</span>
      <span class="dish-card__meta">
        <span v-if="dish.category?.name" class="dish-card__category">{{ dish.category.name }}</span>
        <span class="dish-card__ingredients">
          {{ ingredientCount }} {{ ingredientWord }}
        </span>
      </span>
    </div>
  </button>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  dish: { type: Object, required: true },
})

defineEmits(["tap"])

const ingredientCount = computed(() => props.dish.dish_ingredients?.length ?? 0)

const ingredientWord = computed(() => {
  const n = ingredientCount.value
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return "ингредиентов"
  if (mod10 === 1) return "ингредиент"
  if (mod10 >= 2 && mod10 <= 4) return "ингредиента"
  return "ингредиентов"
})
</script>

<style scoped>
.dish-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  text-align: left;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.dish-card:active {
  background: var(--color-empty);
}

.dish-card__main {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.dish-card__name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dish-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.dish-card__category {
  font-weight: 500;
}

.dish-card__ingredients {
  opacity: 0.7;
}
</style>
