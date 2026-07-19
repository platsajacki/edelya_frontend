<template>
  <div class="week-grid">
    <!-- Collapsed past days toggle -->
    <button
      v-if="pastDays.length"
      type="button"
      class="week-grid__past-toggle"
      @click="showPast = !showPast"
    >
      <IconChevronRight
        class="week-grid__past-chevron"
        :class="{ 'week-grid__past-chevron--open': showPast }"
        :width="16"
        :height="16"
      />
      <span class="week-grid__past-label">Прошедшие дни · {{ pastLabel }}</span>
    </button>

    <!-- Past days (expandable) -->
    <Transition name="expand">
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
        <span v-if="planning.loadingNextWeek" class="week-grid__next-spinner"
          ><span class="spinner spinner--sm"
        /></span>
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

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { DAY_LABELS, splitDays, pastDaysLabel, getNextWeekInfo } from "../utils/weekDays"
import { usePlanningStore } from "../store/planning"
import type { DTOWeekDishes, DTOMealPlanItem, DTOCookingEvent } from "@/types/planning"
import DayRow from "./DayRow.vue"
import IconChevronRight from "@/components/icons/IconChevronRight.vue"

const planning = usePlanningStore()

const props = defineProps<{
  weekData: DTOWeekDishes
}>()

defineEmits<{
  (e: "tap-cooking", event: DTOCookingEvent): void
  (e: "tap-meal", event: DTOMealPlanItem): void
  (e: "add-cooking", rawDate: string): void
  (e: "add-meal", rawDate: string): void
  (
    e: "drag-end",
    payload: {
      itemId: string
      fromDate: string
      toDate: string
      oldIndex: number
      newIndex: number
      type: "meals" | "cooking"
    }
  ): void
  (e: "create-shopping-day", payload: { rawDate: string; dayLabel: string }): void
}>()

const showPast = ref(false)
const showNextWeek = ref(false)

// Reset collapse state when week changes
watch(
  () => props.weekData.start_week,
  () => {
    showPast.value = false
    showNextWeek.value = false
  }
)

const days = computed(() => {
  const start = new Date(props.weekData.start_week + "T00:00:00")
  const result = []

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    const meals = props.weekData.meal_plan_items
      .filter((m) => m.date === dateStr)
      .sort((a, b) => a.position - b.position)

    const cookingEvents = props.weekData.cooking_events.filter((e) => e.cooking_date === dateStr)

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
const nextWeekLabel = "Следующая неделя"

const nextWeekDays = computed(() => {
  const data = planning.nextWeekData
  if (!data) return []
  const start = new Date(data.start_week + "T00:00:00")
  const result = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const meals = data.meal_plan_items
      .filter((m) => m.date === dateStr)
      .sort((a, b) => a.position - b.position)
    const cookingEvents = data.cooking_events.filter((e) => e.cooking_date === dateStr)
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

async function loadNext() {
  const { year, week } = nextInfo.value
  await planning.loadNextWeek(year, week)
  showNextWeek.value = true
}
</script>

<style lang="scss" scoped>
@use "../styles/mixins" as mixins;

.week-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__past-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-border);
    }
  }

  &__past-chevron {
    flex-shrink: 0;
    color: var(--color-text-secondary);
    transition: transform var(--transition-normal);

    &--open {
      transform: rotate(90deg);
    }
  }

  &__past-label {
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__past-days {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__today-divider,
  &__section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
  }

  &__today-line,
  &__section-line {
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  &__today-badge,
  &__section-badge {
    font-size: var(--font-xs);
    font-weight: 600;
    color: var(--color-mint);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  &__next-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    padding: 10px 16px;
    margin: 4px 0 0;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-md);
    background: transparent;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:active {
      background: var(--color-empty);
    }
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  &__next-text {
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
  }

  &__next-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }
}

@include mixins.expand-transition(2000px);
</style>
