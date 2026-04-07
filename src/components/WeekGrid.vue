<template>
  <div class="week-grid">
    <div class="week-grid__header">
      <div class="week-grid__header-spacer"></div>
      <div class="week-grid__header-col week-grid__header-col--cook">
        <IconPot />
        Готовлю
      </div>
      <div class="week-grid__header-col week-grid__header-col--eat">
        <IconFork />
        Ем
      </div>
    </div>

    <DayRow
      v-for="day in days"
      :key="day.rawDate"
      :day="day.label"
      :date="day.date"
      :raw-date="day.rawDate"
      :meals="day.meals"
      :cooking-events="day.cookingEvents"
      @tap-cooking="$emit('tap-cooking', $event)"
      @tap-meal="$emit('tap-meal', $event)"
      @add-cooking="$emit('add-cooking', $event)"
      @add-meal="$emit('add-meal', $event)"
      @drag-end="$emit('drag-end', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import DayRow from "./DayRow.vue"
import IconPot from "./icons/IconPot.vue"
import IconFork from "./icons/IconFork.vue"

const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

const props = defineProps({
  weekData: {
    type: Object,
    required: true,
  },
})

defineEmits(['add-cooking', 'add-meal', 'tap-cooking', 'tap-meal', 'drag-end'])

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
      rawDate: dateStr,
      date: formatYMDtoDDMMYYYY(dateStr),
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
  gap: 12px;
}

.week-grid__header {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  column-gap: 12px;
  padding: 0 16px;
}

.week-grid__header-spacer {
  /* Spacer to align with day label column */
}

.week-grid__header-col {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: var(--font-sm);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 0;
  border-radius: var(--radius-sm);
}

.week-grid__header-col--eat {
  color: var(--color-eat);
  background: var(--color-eat-bg-strong);
}

.week-grid__header-col--cook {
  color: var(--color-cook);
  background: var(--color-cook-bg-strong);
}
</style>
