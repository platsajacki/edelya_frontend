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
      @tap-cooking="openCookingDetail"
      @tap-meal="openMealDetail"
      @drag-end="onDragEnd"
    />

    <!-- Create / Edit forms -->
    <CookingEventForm
      v-model="showCookingForm"
      :edit-item="editCookingItem"
      :initial-date="initialCookingDate"
    />

    <MealPlanItemForm
      v-model="showMealForm"
      :edit-item="editMealItem"
      :initial-date="initialMealDate"
    />

    <!-- Detail sheets -->
    <CardDetailSheet
      v-model="showCookingDetail"
      :item="detailItem"
      type="cooking"
      @edit="onEditCooking"
      @delete="onDeleteCooking"
    />

    <CardDetailSheet
      v-model="showMealDetail"
      :item="detailItem"
      type="meal"
      @edit="onEditMeal"
      @delete="onDeleteMeal"
      @view-cooking="onViewCookingFromMeal"
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
import CardDetailSheet from "./CardDetailSheet.vue"
import { usePlanningStore } from "../store/planning"
import { fetchCookingEvent } from "../services/planningService"

defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const planning = usePlanningStore()

// --- Create flow ---
const showCookingForm = ref(false)
const showMealForm = ref(false)
const editCookingItem = ref(null)
const editMealItem = ref(null)

const initialCookingDate = ref("")
const initialMealDate = ref("")

function openCookingForm(date) {
  editCookingItem.value = null
  initialCookingDate.value = date || ""
  showCookingForm.value = true
}

function openMealForm(date) {
  editMealItem.value = null
  initialMealDate.value = date || ""
  showMealForm.value = true
}

// --- Detail flow ---
const showCookingDetail = ref(false)
const showMealDetail = ref(false)
const detailItem = ref(null)

function openCookingDetail(item) {
  detailItem.value = item
  showCookingDetail.value = true
}

function openMealDetail(item) {
  detailItem.value = item
  showMealDetail.value = true
}

async function onViewCookingFromMeal(cookingEventId) {
    showMealDetail.value = false
    let event = planning.weekData.cooking_events.find((e) => e.id === cookingEventId)
    if (!event) {
      try {
        event = await fetchCookingEvent(cookingEventId)
      } catch {
        planning.showToast("Не удалось загрузить готовку")
        return
      }
    }
    detailItem.value = event
    showCookingDetail.value = true
}

// --- Edit from detail ---
function onEditCooking() {
  const item = detailItem.value
  showCookingDetail.value = false
  editCookingItem.value = item
  showCookingForm.value = true
}

function onEditMeal() {
  const item = detailItem.value
  showMealDetail.value = false
  editMealItem.value = item
  showMealForm.value = true
}

// --- Delete from detail ---
async function onDeleteCooking() {
  const item = detailItem.value
  showCookingDetail.value = false
  try {
    await planning.removeCookingEvent(item.id)
  } catch {
    // toast shown by store
  }
}

async function onDeleteMeal() {
  const item = detailItem.value
  showMealDetail.value = false
  try {
    await planning.removeMealPlanItem(item.id)
  } catch {
    // toast shown by store
  }
}

function onDragEnd(data) {
  planning.handleDragEnd(data)
}

onMounted(() => {
  planning.loadWeek()
})
</script>

<style scoped>
.planner {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 80px;
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
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 13px;
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

@media (min-width: 600px) {
  .planner {
    max-width: 540px;
    padding: 16px 24px 88px;
  }
}
</style>
