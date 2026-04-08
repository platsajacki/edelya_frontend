<template>
  <div class="week-grid">
    <div class="week-grid__week-actions">
      <button type="button" class="week-grid__week-shopping-btn" @click="onWeekShopping">
        <IconShoppingBag :width="15" :height="15" :stroke-width="1.6" />
        <span>На неделю</span>
      </button>
    </div>
    <div class="week-grid__header">
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
      <span class="week-grid__past-label">Прошедшие дни · {{ pastLabel }}</span>
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
          @create-shopping-day="$emit('create-shopping-day', $event)"
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
      @create-shopping-day="$emit('create-shopping-day', $event)"
    />

    <!-- Next week section -->
    <template v-if="!showNextWeek">
      <button
        type="button"
        class="week-grid__next-toggle"
        :disabled="planning.loadingNextWeek"
        @click="loadNext"
      >
        <span v-if="planning.loadingNextWeek" class="week-grid__next-spinner"><span class="spinner spinner--sm" /></span>
        <span v-else class="week-grid__next-text">Показать следующую неделю</span>
      </button>
    </template>

    <template v-if="showNextWeek">
      <!-- Next week divider -->
      <div class="week-grid__section-divider">
        <span class="week-grid__section-line"></span>
        <span class="week-grid__section-badge">{{ nextWeekLabel }}</span>
        <span class="week-grid__section-line"></span>
      </div>

      <DayRow
        v-for="day in nextWeekDays"
        :key="'next-' + day.rawDate"
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
        @create-shopping-day="$emit('create-shopping-day', $event)"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { DAY_LABELS, splitDays, pastDaysLabel, getNextWeekInfo, getTodayISO } from "../utils/weekDays"
import { usePlanningStore } from "../store/planning"
import DayRow from "./DayRow.vue"
import IconPot from "./icons/IconPot.vue"
import IconFork from "./icons/IconFork.vue"
import IconShoppingBag from "./icons/IconShoppingBag.vue"

const planning = usePlanningStore()

const props = defineProps({
  weekData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-cooking', 'add-meal', 'tap-cooking', 'tap-meal', 'drag-end', 'create-shopping-day', 'create-shopping-week'])

const showPast = ref(false)
const showNextWeek = ref(false)

// Reset collapse state when week changes
watch(() => props.weekData.start_week, () => {
  showPast.value = false
  showNextWeek.value = false
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

const nextInfo = computed(() => getNextWeekInfo(props.weekData.start_week))
const nextWeekLabel = 'Следующая неделя'

const nextWeekDays = computed(() => {
  const data = planning.nextWeekData
  if (!data) return []
  const start = new Date(data.start_week + 'T00:00:00')
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const meals = data.meal_plan_items
      .filter((m) => m.date === dateStr)
      .sort((a, b) => a.position - b.position)
    const cookingEvents = data.cooking_events
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

const weekEndDate = computed(() => {
  const start = new Date(props.weekData.start_week + 'T00:00:00')
  start.setDate(start.getDate() + 6)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`
})

function onWeekShopping() {
  const today = getTodayISO()
  // On the current week start from today; on any other week start from the week's Monday
  const dateFrom = today >= props.weekData.start_week && today <= weekEndDate.value
    ? today
    : props.weekData.start_week
  emit('create-shopping-week', { dateFrom, dateTo: weekEndDate.value })
}

async function loadNext() {
  const { year, week } = nextInfo.value
  await planning.loadNextWeek(year, week)
  showNextWeek.value = true
}
</script>

<style scoped>
.week-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.week-grid__week-actions {
  display: flex;
  justify-content: flex-end;
  padding: 0 16px;
}

.week-grid__week-shopping-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--transition-fast), background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.week-grid__week-shopping-btn:hover {
  color: var(--color-mint);
  background: color-mix(in srgb, var(--color-mint) 10%, transparent);
}

.week-grid__week-shopping-btn:active {
  background: var(--color-empty);
}

.week-grid__header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-row: 1fr;
  column-gap: 5px;
  padding: 0 5px 0 5px;
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

/* ── Next week toggle button ── */
.week-grid__next-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  margin: 4px 16px 0;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.week-grid__next-toggle:active {
  background: var(--color-bg-secondary);
}

.week-grid__next-toggle:disabled {
  opacity: 0.6;
  cursor: default;
}

.week-grid__next-text {
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

/* ── Next week divider (same as today but secondary color) ── */
.week-grid__section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
}

.week-grid__section-line {
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.week-grid__section-badge {
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color-mint);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}
</style>
