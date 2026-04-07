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

    <!-- Collapsed past days toggle -->
    <button
      v-if="pastDays.length"
      type="button"
      class="week-grid__past-toggle"
      @click="showPast = !showPast"
    >
      <svg
        class="week-grid__past-chevron"
        :class="{ 'week-grid__past-chevron--open': showPast }"
        width="16" height="16" viewBox="0 0 20 20" fill="none"
      >
        <path d="M7.5 5L12.5 10L7.5 15"
          stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span class="week-grid__past-label">{{ pastLabel }}</span>
    </button>

    <!-- Past days (expandable) -->
    <Transition name="past-expand">
      <div v-if="showPast && pastDays.length" class="week-grid__past-days">
        <DayRow
          v-for="day in pastDays"
          :key="day.rawDate"
          :day="day.label"
          :date="day.date"
          :raw-date="day.rawDate"
          :meals="day.meals"
          :cooking-events="day.cookingEvents"
          :muted="true"
          @tap-cooking="$emit('tap-cooking', $event)"
          @tap-meal="$emit('tap-meal', $event)"
          @add-cooking="$emit('add-cooking', $event)"
          @add-meal="$emit('add-meal', $event)"
          @drag-end="$emit('drag-end', $event)"
        />

        <!-- "Сегодня" divider -->
        <div class="week-grid__today-divider">
          <span class="week-grid__today-line"></span>
          <span class="week-grid__today-badge">Сегодня</span>
          <span class="week-grid__today-line"></span>
        </div>
      </div>
    </Transition>

    <!-- Current & future days -->
    <DayRow
      v-for="day in visibleDays"
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
import { computed, ref, watch } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { DAY_LABELS, splitDays, pastDaysLabel } from "../utils/weekDays"
import DayRow from "./DayRow.vue"
import IconPot from "./icons/IconPot.vue"
import IconFork from "./icons/IconFork.vue"

const props = defineProps({
  weekData: {
    type: Object,
    required: true,
  },
})

defineEmits(['add-cooking', 'add-meal', 'tap-cooking', 'tap-meal', 'drag-end'])

const showPast = ref(false)

// Reset collapse state when week changes
watch(() => props.weekData.start_week, () => {
  showPast.value = false
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
      rawDate: dateStr,
      date: formatYMDtoDDMMYYYY(dateStr),
      label: DAY_LABELS[i],
      meals,
      cookingEvents,
    })
  }

  return result
})

const split = computed(() => splitDays(days.value, props.weekData.start_week))
const pastDays = computed(() => split.value.pastDays)
const visibleDays = computed(() => split.value.visibleDays)
const pastLabel = computed(() => pastDaysLabel(pastDays.value))
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

/* ── Past days toggle ── */
.week-grid__past-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-empty);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.week-grid__past-toggle:active {
  background: var(--color-border);
}

.week-grid__past-chevron {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  transition: transform var(--transition-normal);
}

.week-grid__past-chevron--open {
  transform: rotate(90deg);
}

.week-grid__past-label {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ── Past days container ── */
.week-grid__past-days {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── "Сегодня" divider ── */
.week-grid__today-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.week-grid__today-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.week-grid__today-badge {
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color-mint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ── Expand/collapse transition ── */
.past-expand-enter-active {
  transition: opacity var(--transition-normal), max-height 0.35s ease;
  overflow: hidden;
}

.past-expand-leave-active {
  transition: opacity var(--transition-fast), max-height 0.25s ease;
  overflow: hidden;
}

.past-expand-enter-from {
  opacity: 0;
  max-height: 0;
}

.past-expand-enter-to {
  opacity: 1;
  max-height: 2000px;
}

.past-expand-leave-from {
  opacity: 1;
  max-height: 2000px;
}

.past-expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
