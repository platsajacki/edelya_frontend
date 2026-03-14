<template>
  <div class="planner">
    <WeekNav
      :label="planning.weekLabel"
      :disabled="planning.loading"
      @prev="planning.prevWeek"
      @next="planning.nextWeek"
    />
    <WeekGrid
      :week-data="planning.weekData"
      :class="{ 'planner__grid--loading': planning.loading }"
      @add-cooking="openCookingForm"
      @add-meal="openMealForm"
    />

    <CookingEventForm
      v-model="showCookingForm"
      :date="formDate"
    />

    <MealPlanItemForm
      v-model="showMealForm"
      :date="formDate"
    />

    <Transition name="toast">
      <div v-if="planning.toast" class="planner__toast" @click="planning.toast = null">
        {{ planning.toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import WeekNav from "./WeekNav.vue"
import WeekGrid from "./WeekGrid.vue"
import CookingEventForm from "./forms/CookingEventForm.vue"
import MealPlanItemForm from "./forms/MealPlanItemForm.vue"
import { usePlanningStore } from "../store/planning"

defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const planning = usePlanningStore()

const showCookingForm = ref(false)
const showMealForm = ref(false)
const formDate = ref("")

function openCookingForm(date) {
  formDate.value = date
  showCookingForm.value = true
}

function openMealForm(date) {
  formDate.value = date
  showMealForm.value = true
}

onMounted(() => {
  planning.loadWeek()
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
  position: relative;
}

.planner__grid--loading {
  opacity: 0.5;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.planner__toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 14px;
  box-shadow: var(--shadow-elevated);
  cursor: pointer;
  z-index: 99999;
  max-width: calc(100vw - 32px);
  text-align: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
