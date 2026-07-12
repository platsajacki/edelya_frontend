<template>
  <div class="page-layout planner">
    <WeekNav
      :label="planning.weekLabel"
      :disabled="planning.loading"
      :is-current-week="planning.isCurrentWeek"
      @prev="goPrevWeek"
      @next="goNextWeek"
      @today="goToToday"
      @create-shopping-week="handleCreateShoppingWeek"
    />

    <div class="planner__grid-wrap" :class="{ 'planner__grid-wrap--loading': planning.loading }">
      <Transition :name="weekTransitionName">
        <WeekGrid
          :key="planning.weekData.start_week"
          :week-data="planning.weekData"
          @add-cooking="openCookingForm"
          @add-meal="openMealForm"
          @tap-cooking="openCookingDetail"
          @tap-meal="openMealDetail"
          @drag-end="onDragEnd"
          @create-shopping-day="handleCreateShoppingDay"
        />
      </Transition>
    </div>

    <div v-if="planning.loadError" class="planner__error">
      <span>Не удалось загрузить неделю</span>
      <button class="planner__error-retry" @click="planning.loadWeek()">Повторить</button>
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
      :date-from="pendingShoppingPayload?.date_from ?? ''"
      :date-to="pendingShoppingPayload?.date_to ?? ''"
      :loading="shoppingCreating"
      :no-items="shoppingNoItems"
      @update:date-from="
        (val) => {
          if (pendingShoppingPayload) pendingShoppingPayload.date_from = val
        }
      "
      @update:date-to="
        (val) => {
          if (pendingShoppingPayload) pendingShoppingPayload.date_to = val
        }
      "
      @confirm="onConfirmShopping"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue"
import { useRouter } from "vue-router"
import type { WebAppUser } from "@twa-dev/types"
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
import { getTodayISO } from "../utils/weekDays"
import Toast from "./Toast.vue"
import type { DTOCookingEvent, DTOMealPlanItem } from "@/types/planning"

defineProps<{
  user: WebAppUser
}>()

const planning = usePlanningStore()
const shopping = useShoppingStore()
const router = useRouter()

// --- Shopping confirm ---
const showShoppingConfirm = ref(false)
const shoppingCreating = ref(false)
const pendingShoppingPayload = ref<{ date_from: string; date_to: string } | null>(null)

const shoppingNoItems = computed(() => {
  if (!pendingShoppingPayload.value) return false
  const { date_from, date_to } = pendingShoppingPayload.value
  if (!date_from || !date_to) return false
  return !hasCookingInRange(date_from, date_to)
})

const weekEndDate = computed(() => {
  const start = new Date(planning.weekData.start_week + "T00:00:00")
  start.setDate(start.getDate() + 6)
  return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
})

function hasCookingInRange(dateFrom: string, dateTo: string): boolean {
  const sources = [planning.weekData, planning.nextWeekData].filter(Boolean)
  return sources.some((data) =>
    data.cooking_events.some((e) => e.cooking_date >= dateFrom && e.cooking_date <= dateTo)
  )
}

function handleCreateShoppingDay({ rawDate }: { rawDate: string }) {
  pendingShoppingPayload.value = {
    date_from: rawDate,
    date_to: rawDate,
  }
  showShoppingConfirm.value = true
}

function handleCreateShoppingWeek({
  dateFrom,
  dateTo,
}: { dateFrom?: string; dateTo?: string } = {}) {
  const today = getTodayISO()
  const from =
    dateFrom ||
    (today >= planning.weekData.start_week && today <= weekEndDate.value
      ? today
      : planning.weekData.start_week)
  const to = dateTo || weekEndDate.value
  pendingShoppingPayload.value = {
    date_from: from,
    date_to: to,
  }
  showShoppingConfirm.value = true
}

async function onConfirmShopping(name: string) {
  if (!pendingShoppingPayload.value) return
  const { date_from, date_to } = pendingShoppingPayload.value
  const resolvedName =
    name ||
    (!date_to || date_from === date_to
      ? `Продукты на ${formatDateRuShort(date_from)}`
      : `Продукты на неделю ${formatDateRuShort(date_from)}–${formatDateRuShort(date_to)}`)
  shoppingCreating.value = true
  try {
    const list = await shopping.createList({ name: resolvedName, date_from, date_to })
    showShoppingConfirm.value = false
    router.push(`/shopping/${list.id}`)
  } finally {
    shoppingCreating.value = false
  }
}

// --- Create flow ---
const showCookingForm = ref(false)
const showMealForm = ref(false)
const editCookingItem = ref<DTOCookingEvent | null>(null)
const editMealItem = ref<DTOMealPlanItem | null>(null)

const initialCookingDate = ref("")
const initialMealDate = ref("")

function openCookingForm(date: string) {
  editCookingItem.value = null
  initialCookingDate.value = date || ""
  showCookingForm.value = true
}

function openMealForm(date: string) {
  editMealItem.value = null
  initialMealDate.value = date || ""
  showMealForm.value = true
}

// --- Detail flow ---
const showCookingDetail = ref(false)
const showMealDetail = ref(false)
const detailItem = ref<DTOCookingEvent | DTOMealPlanItem | null>(null)

function openCookingDetail(item: DTOCookingEvent) {
  detailItem.value = item
  showCookingDetail.value = true
}

function openMealDetail(item: DTOMealPlanItem) {
  detailItem.value = item
  showMealDetail.value = true
}

async function onViewCookingFromMeal(cookingEventId: string) {
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

// --- Week navigation direction ---
const weekTransitionName = ref<"slide-forward" | "slide-back">("slide-forward")

function goPrevWeek() {
  weekTransitionName.value = "slide-back"
  planning.prevWeek()
}

function goNextWeek() {
  weekTransitionName.value = "slide-forward"
  planning.nextWeek()
}

function goToToday() {
  weekTransitionName.value =
    getTodayISO() > planning.weekData.end_week ? "slide-forward" : "slide-back"
  planning.goToToday()
}

// --- Edit from detail ---
function onEditCooking() {
  const item = detailItem.value as DTOCookingEvent
  showCookingDetail.value = false
  editCookingItem.value = item
  showCookingForm.value = true
}

function onEditMeal() {
  const item = detailItem.value as DTOMealPlanItem
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

function onDragEnd(data: Parameters<typeof planning.handleDragEnd>[0]) {
  planning.handleDragEnd(data)
}

onMounted(() => {
  planning.loadWeek()
})
</script>

<style lang="scss" scoped>
.planner {
  padding: var(--page-padding-top) 16px 16px;
  position: relative;

  @media (min-width: 600px) {
    padding: var(--page-padding-top-lg) 24px 24px;
  }

  &__grid-wrap {
    position: relative;

    &--loading {
      opacity: 0.75;
      transition: opacity var(--transition-normal);
      pointer-events: none;
    }
  }

  &__error {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--color-danger-pale);
    border: 1px solid var(--color-danger-soft);
    border-radius: var(--radius-sm);
    font-size: var(--font-body);
    color: var(--color-danger-dark);

    &-retry {
      padding: 6px 16px;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--color-danger);
      color: var(--on-primary);
      font-size: var(--font-sm);
      font-weight: 600;
    }
  }
}
</style>
