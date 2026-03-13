<template>
  <div class="week-grid">
    <div class="week-grid__header">
      <div class="week-grid__header-spacer"></div>
      <div class="week-grid__header-col week-grid__header-col--cook">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 6h12M3 6l1 8h8l1-8M6 6V4a2 2 0 014 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Готовлю
      </div>
      <div class="week-grid__header-col week-grid__header-col--eat">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 2v5a2 2 0 002 2h0a2 2 0 002-2V2M6 2v3M8 2v3M7 9v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Ем
      </div>
    </div>

    <DayRow
      v-for="day in days"
      :key="day.date"
      :day="day.label"
      :date="day.date"
      :meals="day.meals"
      :cooking-events="day.cookingEvents"
    />
  </div>
</template>

<script setup>
import { computed } from "vue"
import DayRow from "./DayRow.vue"

const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

const props = defineProps({
  weekData: {
    type: Object,
    required: true,
  },
})

const days = computed(() => {
  const start = new Date(props.weekData.start_week + "T00:00:00")
  const result = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    const meals = props.weekData.meal_plan_items
      .filter((m) => m.date === dateStr)
      .sort((a, b) => a.position - b.position)

    const cookingEvents = props.weekData.cooking_events
      .filter((e) => e.cooking_date === dateStr)

    result.push({
      date: dateStr,
      label: DAY_LABELS[i],
      meals,
      cookingEvents,
    })
  }

  return result
})
</script>

<style scoped>
.week-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.week-grid__header {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 8px;
  padding: 0 4px;
}

.week-grid__header-spacer {
  /* empty — day label column */
}

.week-grid__header-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 0;
  border-radius: var(--radius-sm);
}

.week-grid__header-col--eat {
  color: var(--color-eat);
  background: var(--color-eat-bg);
}

.week-grid__header-col--cook {
  color: var(--color-cook);
  background: var(--color-cook-bg);
}
</style>
