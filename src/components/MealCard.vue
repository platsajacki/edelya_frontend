<template>
  <div class="meal-card">
    <span class="meal-card__name">{{ dish.name }}</span>
  </div>
</template>

<script setup>
defineProps({
  dish: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.meal-card {
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--card-bg, var(--color-empty));
  border-left: 3px solid var(--card-accent, var(--color-mint));
  font-size: 14px;
  text-align: left;
  transition: box-shadow 0.15s, transform 0.15s;
}

.meal-card:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-elevated);
}

.meal-card__name {
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-text);
}
</style>
