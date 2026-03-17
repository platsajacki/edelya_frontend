<template>
    <div class="day-row">
        <div class="day-row__label">{{ day }}<br>{{ date.slice(0, 2) }}</div>

        <div class="day-row__cook">
          <MealCard
            v-for="event in cookingEvents"
            :key="event.id"
            :item="event"
            @tap="$emit('tap-cooking', $event)"
          />
          <button type="button" class="day-row__add day-row__add--cook" @click="$emit('add-cooking', rawDate)">
            +
          </button>
        </div>

        <div class="day-row__eat">
          <MealCard
            v-for="item in meals"
            :key="item.id"
            :item="item"
            @tap="$emit('tap-meal', $event)"
          />
          <button type="button" class="day-row__add day-row__add--eat" @click="$emit('add-meal', rawDate)">
            +
          </button>
        </div>
    </div>
</template>

<script setup>
import MealCard from './MealCard.vue'

defineProps({
  day: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String, required: true },
  meals: { type: Array, default: () => [] },
  cookingEvents: { type: Array, default: () => [] },
})

defineEmits(["tap-cooking", "tap-meal", "add-cooking", "add-meal"])
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4px 0;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  color: var(--color-text-secondary);
}

.day-row__add--cook:hover {
  border-color: var(--color-cook);
  color: var(--color-cook);
  background: var(--color-cook-bg);
}

.day-row__add--eat:hover {
  border-color: var(--color-eat);
  color: var(--color-eat);
  background: var(--color-eat-bg);
}
</style>
