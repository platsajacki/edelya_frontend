<template>
  <div class="page-layout planner">
    <WeekNav
      :label="planning.weekLabel"
      :disabled="planning.loading"
      @prev="planning.prevWeek"
      @next="planning.nextWeek"
    />

    <WeekGrid
      :week-data="planning.weekData"
      :greeting="user?.first_name ? `${greeting}, ${user.first_name}!` : ''"
      :class="{ 'planner__grid--loading': planning.loading }"
      @add-cooking="openCookingForm"
      @add-meal="openMealForm"
      @tap-cooking="openCookingDetail"
      @tap-meal="openMealDetail"
      @drag-end="onDragEnd"
      @create-shopping-day="handleCreateShoppingDay"
      @create-shopping-week="handleCreateShoppingWeek"
    />

    <div v-if="planning.loadError" class="planner__error">
      <span>Не удалось загрузить неделю</span>
      <button class="planner__error-retry" @click="planning.loadWeek()">
        Повторить
      </button>
    </div>

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

    <Toast :message="planning.toast" @dismiss="planning.toast = null" />

    <!-- Shopping list confirm -->
    <ShoppingConfirmSheet
      v-model="showShoppingConfirm"
      :message="shoppingConfirmMsg"
      :loading="shoppingCreating"
      @confirm="onConfirmShopping"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"
import WeekNav from "./WeekNav.vue"
import WeekGrid from "./WeekGrid.vue"
import CookingEventForm from "./forms/CookingEventForm.vue"
import MealPlanItemForm from "./forms/MealPlanItemForm.vue"
import CardDetailSheet from "./CardDetailSheet.vue"
import ShoppingConfirmSheet from "./ShoppingConfirmSheet.vue"
import { usePlanningStore } from "../store/planning"
import { useShoppingStore } from "../store/shopping"
import { fetchCookingEvent } from "../services/planningService"
import { formatDateRuShort } from "../utils/formatDate"
import Toast from "./Toast.vue"

defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const planning = usePlanningStore()
const shopping = useShoppingStore()
const router = useRouter()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 18) return 'Добрый день'
  if (h >= 18 && h < 23) return 'Добрый вечер'
  return 'Доброй ночи'
})

// --- Shopping confirm ---
const showShoppingConfirm = ref(false)
const shoppingConfirmMsg  = ref('')
const shoppingCreating    = ref(false)
const pendingShoppingPayload = ref(null)

function handleCreateShoppingDay({ rawDate, dayLabel }) {
  const dateLabel = formatDateRuShort(rawDate)
  pendingShoppingPayload.value = {
    name:      `Продукты на ${dayLabel} ${dateLabel}`,
    date_from: rawDate,
    date_to:   rawDate,
  }
  shoppingConfirmMsg.value  = `Хотите создать список покупок на ${dayLabel} ${dateLabel}?`
  showShoppingConfirm.value = true
}

function handleCreateShoppingWeek({ dateFrom, dateTo }) {
  pendingShoppingPayload.value = {
    name:      `Продукты на неделю ${formatDateRuShort(dateFrom)}–${formatDateRuShort(dateTo)}`,
    date_from: dateFrom,
    date_to:   dateTo,
  }
  shoppingConfirmMsg.value  = `Хотите создать список покупок с ${formatDateRuShort(dateFrom)} по ${formatDateRuShort(dateTo)}?`
  showShoppingConfirm.value = true
}

async function onConfirmShopping() {
  if (!pendingShoppingPayload.value) return
  shoppingCreating.value = true
  try {
    const list = await shopping.createList(pendingShoppingPayload.value)
    showShoppingConfirm.value = false
    router.push(`/shopping/${list.id}`)
  } finally {
    shoppingCreating.value = false
  }
}

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
  padding: 12px 16px var(--nav-height);
  position: relative;
}

.planner__grid--loading {
  opacity: 0.5;
  transition: opacity var(--transition-normal);
  pointer-events: none;
}

.planner__error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--color-danger-pale);
  border: 1px solid var(--color-danger-soft);
  border-radius: var(--radius-sm);
  font-size: var(--font-body);
  color: var(--color-danger-muted);
}

.planner__error-retry {
  padding: 6px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-danger);
  color: var(--on-primary);
  font-size: var(--font-sm);
  font-weight: 600;
}

@media (min-width: 600px) {
  .planner {
    padding: 16px 24px 88px;
  }
}
</style>
