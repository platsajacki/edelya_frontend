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

    <div class="week-grid__actions">
      <div class="week-grid__actions-spacer"></div>

      <div class="week-grid__action-wrap">
        <button class="week-grid__add week-grid__add--cook" @click="togglePicker('cooking')">
          <span class="week-grid__add-icon">+</span>
          <span class="week-grid__add-text">Добавить</span>
        </button>
        <Transition name="picker">
          <div v-if="picker === 'cooking'" v-click-outside="closePicker" class="day-picker day-picker--cook">
            <button
              v-for="day in days"
              :key="day.rawDate"
              class="day-picker__item"
              @click="selectDay('cooking', day.rawDate)"
            >
              {{ day.label }}
              <span class="day-picker__date">{{ day.date }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <div class="week-grid__action-wrap">
        <button class="week-grid__add week-grid__add--eat" @click="togglePicker('meal')">
          <span class="week-grid__add-icon">+</span>
          <span class="week-grid__add-text">Добавить</span>
        </button>
        <Transition name="picker">
          <div v-if="picker === 'meal'" v-click-outside="closePicker" class="day-picker day-picker--eat">
            <button
              v-for="day in days"
              :key="day.rawDate"
              class="day-picker__item"
              @click="selectDay('meal', day.rawDate)"
            >
              {{ day.label }}
              <span class="day-picker__date">{{ day.date }}</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <DayRow
      v-for="day in days"
      :key="day.rawDate"
      :day="day.label"
      :date="day.date"
      :meals="day.meals"
      :cooking-events="day.cookingEvents"
      @tap-cooking="$emit('tap-cooking', $event)"
      @tap-meal="$emit('tap-meal', $event)"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import DayRow from "./DayRow.vue"

const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

const props = defineProps({
  weekData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['add-cooking', 'add-meal', 'tap-cooking', 'tap-meal'])

const picker = ref(null)

function togglePicker(type) {
  picker.value = picker.value === type ? null : type
}

function closePicker() {
  picker.value = null
}

function selectDay(type, date) {
  picker.value = null
  if (type === 'cooking') emit('add-cooking', date)
  else emit('add-meal', date)
}

// Click-outside directive
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (e) => {
      if (!el.contains(e.target) && !e.target.closest('.week-grid__add')) {
        binding.value()
      }
    }
    setTimeout(() => document.addEventListener('click', el._clickOutside), 0)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  },
}

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
  gap: 10px;
}

.week-grid__header {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 8px;
  padding: 0 4px;
  margin-bottom: -6px;
}

.week-grid__header-spacer {
  
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

/* Action buttons row */
.week-grid__actions {
  display: grid;
  grid-template-columns: 36px 1fr 1fr;
  gap: 8px;
  padding: 0 4px;
}

.week-grid__actions-spacer {}

.week-grid__action-wrap {
  position: relative;
  display: flex;
  justify-content: center;
}

.week-grid__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: 100%;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: background 0.15s, opacity 0.15s;
}

.week-grid__add--cook {
  color: var(--color-cook);
  background: var(--color-cook-bg);
}

.week-grid__add--cook:hover {
  background: rgba(245, 158, 11, 0.18);
}

.week-grid__add--eat {
  color: var(--color-eat);
  background: var(--color-eat-bg);
}

.week-grid__add--eat:hover {
  background: rgba(79, 134, 247, 0.18);
}

.week-grid__add-icon {
  font-size: 15px;
  font-weight: 400;
  line-height: 1;
}

.week-grid__add-text {
  line-height: 1;
}

/* Day picker dropdown */
.day-picker {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 160px;
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-elevated);
  border: 1px solid var(--color-border);
  z-index: 100;
  overflow: hidden;
}

.day-picker__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  text-align: left;
  transition: background 0.1s;
}

.day-picker__item:hover {
  background: var(--color-empty);
}

.day-picker__item + .day-picker__item {
  border-top: 1px solid var(--color-border);
}

.day-picker__date {
  font-size: 12px;
  font-weight: 400;
  color: var(--color-text-secondary);
}

.day-picker--cook .day-picker__item:hover {
  background: var(--color-cook-bg);
}

.day-picker--eat .day-picker__item:hover {
  background: var(--color-eat-bg);
}

/* Picker transitions */
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-4px);
}
</style>
