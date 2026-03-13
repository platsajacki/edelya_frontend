<template>
  <div class="planner">
    <WeekNav :label="weekLabel" @prev="() => {}" @next="() => {}" />
    <WeekGrid :week-data="weekData" />
  </div>
</template>

<script setup>
import { computed } from "vue"
import WeekNav from "./WeekNav.vue"
import WeekGrid from "./WeekGrid.vue"
import { mockWeekData } from "../mocks/weekData"

defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const weekData = mockWeekData

const weekLabel = computed(() => {
  const fmt = (iso) => {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  }
  return `${fmt(weekData.start_week)} – ${fmt(weekData.end_week)}`
})
</script>

<style scoped>
.planner {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 100dvh;
}
</style>
