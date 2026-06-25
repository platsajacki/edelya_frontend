<template>
  <ModalWrapper v-model="open" :title="title" :z-index="990">
    <div class="detail">
      <!-- 1. Dish header: name + category -->
      <div class="detail__section">
        <div class="detail__dish-header">
          <div class="detail__dish-title-row">
            <h4 class="detail__dish-name">{{ dish?.name }}</h4>
            <OwnershipBadge :is-own="isOwn" />
          </div>
          <button
            type="button"
            class="detail__dish-edit"
            :title="isOwn ? 'Редактировать рецепт' : 'Создать личную копию'"
            @click="handleDishEdit"
          >
            <IconPencil />
          </button>
        </div>
        <p v-if="dish.category?.name" class="detail__meta">
          {{ dish.category.name }}
        </p>
      </div>

      <!-- 2. Dates + source (type-specific) -->
      <div v-if="type === 'cooking'" class="detail__section">
        <div class="detail__row">
          <span class="detail__label">Дата готовки</span>
          <span class="detail__value">{{ formatDate(cookingItem?.cooking_date ?? "") }}</span>
        </div>
        <div class="detail__row detail__row--col">
          <span class="detail__label">Дни еды</span>
          <div v-if="eatDates.length" class="detail__eat-dates">
            <span v-for="d in eatDates" :key="d" class="detail__eat-date">{{ formatDate(d) }}</span>
          </div>
          <span v-else class="detail__value detail__value--muted">Нет запланированных дней</span>
        </div>
        <div v-if="cookingItem?.notes" class="detail__row detail__row--col">
          <span class="detail__label">Комментарий</span>
          <span class="detail__value">{{ cookingItem?.notes }}</span>
        </div>
      </div>

      <div v-if="type === 'meal'" class="detail__section">
        <div class="detail__row">
          <span class="detail__label">Дата</span>
          <span class="detail__value">{{ formatDate(mealItem?.date ?? "") }}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">Источник</span>
          <button
            v-if="mealItem?.cooking_event"
            type="button"
            class="detail__link"
            @click="$emit('view-cooking', mealItem!.cooking_event)"
          >
            Из готовки →
          </button>
          <span v-else class="detail__value detail__value--muted">Ручной ввод</span>
        </div>
      </div>

      <!-- 3. Ingredients -->
      <div v-if="dish.dish_ingredients?.length" class="detail__section">
        <span class="detail__label">Состав</span>
        <ul class="detail__ingredients">
          <li v-for="di in dish.dish_ingredients" :key="di.id" class="detail__ingredient">
            <span class="detail__ingredient-name">{{ di.ingredient.name }}</span>
            <span class="detail__ingredient-right">
              <span v-if="di.is_optional" class="detail__ingredient-optional">опц.</span>
              <span class="detail__ingredient-amount">
                {{ formatShoppingAmount(di.amount, di.ingredient.base_unit).display }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <!-- 4. Recipe text -->
      <div v-if="dish.recipe" class="detail__section">
        <span class="detail__label">Рецепт</span>
        <p class="detail__recipe">{{ dish.recipe }}</p>
      </div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <button class="detail__btn detail__btn--edit" @click="$emit('edit')">
          {{ type === "cooking" ? "Редактировать готовку" : "Редактировать" }}
        </button>
        <button class="detail__btn detail__btn--delete" @click="confirming = true">Удалить</button>
        <button class="detail__btn detail__btn--cancel" @click="open = false">Отмена</button>
      </div>
    </template>
  </ModalWrapper>

  <!-- Delete confirmation modal -->
  <ModalWrapper v-model="confirming" title="Подтверждение" :z-index="1050">
    <p class="detail__confirm-text">
      Удалить {{ type === "cooking" ? "готовку" : "приём пищи" }} «{{ dish?.name }}»?
    </p>
    <template #footer>
      <div class="detail__confirm-actions">
        <button
          class="detail__btn detail__btn--delete"
          @click="
            () => {
              confirming = false
              open = false
              $emit('delete')
            }
          "
        >
          Удалить
        </button>
        <button class="detail__btn detail__btn--cancel" @click="confirming = false">Отмена</button>
      </div>
    </template>
  </ModalWrapper>

  <DishForm v-model="showDishForm" :z-index="1020" :edit-dish="dish" @updated="onDishUpdated" />

  <!-- Clone DishForm -->
  <DishForm v-model="showCloneForm" :z-index="1020" :clone-dish="dish" @created="onCloneCreated" />
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./forms/ModalWrapper.vue"
import DishForm from "./forms/DishForm.vue"
import IconPencil from "./icons/IconPencil.vue"
import OwnershipBadge from "./OwnershipBadge.vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { usePlanningStore } from "../store/planning"
import { isDishOwn } from "../utils/dishOwnership"
import type { DTOCookingEvent, DTOMealPlanItem } from "@/types/planning"
import type { DTODish } from "@/types/dish"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    item?: DTOCookingEvent | DTOMealPlanItem | null
    type?: "cooking" | "meal"
  }>(),
  { item: null, type: "cooking" }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "edit"): void
  (e: "delete"): void
  (e: "view-cooking", cookingEvent: string | null | undefined): void
}>()

const planning = usePlanningStore()

const open = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    open.value = v
  }
)
watch(open, (v) => {
  emit("update:modelValue", v)
})

const confirming = ref(false)
const showDishForm = ref(false)
const showCloneForm = ref(false)

const cookingItem = computed(() =>
  props.type === "cooking" ? (props.item as DTOCookingEvent | null) : null
)
const mealItem = computed(() =>
  props.type === "meal" ? (props.item as DTOMealPlanItem | null) : null
)
const dish = computed(() => props.item?.dish ?? null)

const isOwn = computed(() => isDishOwn(dish.value))

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      confirming.value = false
    }
  }
)

const eatDates = computed(() => {
  const items = cookingItem.value?.meal_plan_items ?? []
  return items.map((m) => m.date).sort()
})

const title = computed(() => {
  if (props.type === "cooking") return "Готовка"
  return "Приём пищи"
})

function formatDate(iso: string): string {
  return formatYMDtoDDMMYYYY(iso)
}

async function onDishUpdated() {
  showDishForm.value = false
  await planning.loadWeek()
  open.value = false
}

function handleDishEdit() {
  if (isOwn.value) {
    showDishForm.value = true
  } else {
    showCloneForm.value = true
  }
}

async function onCloneCreated(newDish: DTODish) {
  showCloneForm.value = false
  if (cookingItem.value?.id) {
    await planning.editCookingEvent(cookingItem.value.id, {
      dish: newDish.id as unknown as DTODish,
      cooking_date: cookingItem.value.cooking_date,
      eat_dates: eatDates.value,
      notes: cookingItem.value.notes || undefined,
    })
  }
  await planning.loadWeek()
  open.value = false
}
</script>

<style>
@import "../styles/detail-sheet.scss";
</style>

<style lang="scss" scoped>
.detail {
  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;

    &--col {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__eat-dates {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__eat-date {
    font-size: var(--font-sm);
    font-weight: 400;
    color: var(--color-text-secondary);
  }

  &__link {
    border: none;
    background: none;
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-mint);
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition:
      color var(--transition-fast),
      text-decoration-thickness var(--transition-fast);

    &:hover {
      color: var(--color-mint-hover);
      text-decoration-thickness: 2px;
    }
  }

  &__value {
    font-size: var(--font-base);
    font-weight: 500;
    color: var(--color-text);

    &--muted {
      color: var(--color-text-secondary);
      font-weight: 400;
      font-size: var(--font-sm);
    }
  }
}
</style>
