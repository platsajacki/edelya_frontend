<template>
  <button class="meal-card" type="button" :data-id="item.id" @click="$emit('tap', item)">
    <span class="meal-card__name">{{ item.dish.name }}</span>
  </button>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(["tap"])
</script>

<style scoped>
.meal-card {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--card-bg, var(--color-empty));
  border: none;
  border-left: 3px solid var(--card-accent, var(--color-mint));
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.15s, transform 0.15s;
}

.meal-card:hover {
  box-shadow: var(--shadow-card);
  transform: translateY(-1px);
}

.meal-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-elevated);
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
}

.meal-card--drag {
  opacity: 0.9;
  transform: rotate(2deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.meal-card__name {
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
}
</style>
