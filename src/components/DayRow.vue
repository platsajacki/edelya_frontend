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
        </div>

        <div class="day-row__eat">
            <MealCard
              v-for="item in meals"
              :key="item.id"
              :item="item"
              @tap="$emit('tap-meal', $event)"
            />
        </div>
    </div>
</template>

<script setup>
import MealCard from './MealCard.vue'

defineProps({
  day: { type: String, required: true },
  date: { type: String, required: true },
  meals: { type: Array, default: () => [] },
  cookingEvents: { type: Array, default: () => [] },
})

defineEmits(["tap-cooking", "tap-meal"])
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
</style>
