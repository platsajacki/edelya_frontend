<template>
  <DevState label="WeekNav: текущая неделя">
    <WeekNav label="21 – 27 сентября" />
  </DevState>
  <DevState label="WeekNav: другая неделя">
    <WeekNav label="28 сентября – 4 октября" :is-current-week="false" />
  </DevState>
  <DevState label="WeekNav: disabled">
    <WeekNav label="21 – 27 сентября" disabled />
  </DevState>
  <DevState v-for="row in rows" :key="row.label" :label="row.label">
    <DayRow
      :day="fixtures.weekday(row.offset)"
      :date="fixtures.displayDate(row.offset)"
      :raw-date="fixtures.isoDate(row.offset)"
      :cooking-events="row.cooking"
      :meals="row.meals"
      :muted="row.muted"
    />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import { dishes, fixtures } from "../fixtures"
import WeekNav from "@/components/WeekNav.vue"
import DayRow from "@/components/DayRow.vue"

const rows = [
  {
    label: "DayRow: сегодня",
    offset: 0,
    muted: false,
    cooking: [fixtures.cookingEvent(dishes.borsch, 0)],
    meals: [fixtures.mealItem(dishes.borsch, 0), fixtures.mealItem(dishes.olivier, 0)],
  },
  {
    label: "DayRow: будущий день",
    offset: 1,
    muted: false,
    cooking: [fixtures.cookingEvent(dishes.lasagna, 1, { color: "#e07a5f" })],
    meals: [fixtures.mealItem(dishes.syrniki, 1, { is_manual: true })],
  },
  {
    label: "DayRow: прошедший (muted)",
    offset: -1,
    muted: true,
    cooking: [fixtures.cookingEvent(dishes.syrniki, -1)],
    meals: [fixtures.mealItem(dishes.syrniki, -1)],
  },
]
</script>
