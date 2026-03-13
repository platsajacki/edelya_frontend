<template>
  <div class="day-row">
    <div class="day-row__label">{{ day }}</div>

    <div class="day-row__cook">
      <MealCard
        v-for="event in cookingEvents"
        :key="event.id"
        :dish="event.dish"
      />
      <button class="day-row__add">
        <span class="day-row__add-icon">+</span>
        <span class="day-row__add-text">Добавить</span>
      </button>
    </div>

    <div class="day-row__eat">
      <MealCard v-for="item in meals" :key="item.id" :dish="item.dish" />
      <button class="day-row__add">
        <span class="day-row__add-icon">+</span>
        <span class="day-row__add-text">Добавить</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import MealCard from "./MealCard.vue"

defineProps({
  day: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  meals: {
    type: Array,
    default: () => [],
  },
  cookingEvents: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.day-row {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 10px;
  align-items: start;
  padding: 14px 12px;
  min-height: 56px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-day);
}

.day-row__label {
  font-weight: 700;
  font-size: 13px;
  color: var(--color-text-secondary);
  padding-top: 7px;
  text-align: center;
  line-height: 1;
}

.day-row__eat {
  --card-bg: var(--color-eat-bg);
  --card-accent: var(--color-eat);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-row__cook {
  --card-bg: var(--color-cook-bg);
  --card-accent: var(--color-cook);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.day-row__add {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0;
  padding: 4px;
  border: 1.5px dashed transparent;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  overflow: hidden;
}

.day-row__add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--color-empty);
  font-size: 16px;
  font-weight: 500;
  flex-shrink: 0;
  transition: background 0.15s;
}

.day-row__add-text {
  max-width: 0;
  opacity: 0;
  white-space: nowrap;
  overflow: hidden;
  transition: max-width 0.25s ease, opacity 0.2s ease, margin 0.25s ease;
  margin-left: 0;
}

/* Desktop: expand on hover */
@media (hover: hover) {
  .day-row__add:hover {
    border-color: var(--color-border);
    background: var(--color-empty);
    padding: 4px 10px 4px 4px;
  }
  .day-row__add:hover .day-row__add-text {
    max-width: 100px;
    opacity: 1;
    margin-left: 6px;
  }
  .day-row__add:hover .day-row__add-icon {
    background: var(--color-mint);
    color: #fff;
  }
}

/* Mobile: tap feedback */
.day-row__add:active .day-row__add-icon {
  background: var(--color-mint-hover);
  color: #fff;
}
</style>
