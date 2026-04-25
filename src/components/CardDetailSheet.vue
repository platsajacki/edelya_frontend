<template>
  <ModalWrapper v-model="open" :title="title" :z-index="990">
    <div class="detail">
      <!-- Dish info -->
      <div class="detail__section">
        <div class="detail__dish-header">
          <div class="detail__dish-title-row">
            <h4 class="detail__dish-name">{{ dish.name }}</h4>
            <OwnershipBadge :is-own="isOwn" />
          </div>
          <button type="button" class="detail__dish-edit" :title="isOwn ? 'Редактировать блюдо' : 'Создать копию'" @click="handleDishEdit">
            <IconPencil />
          </button>
        </div>
        <p v-if="dish.category?.name" class="detail__meta">
          {{ dish.category.name }}
        </p>
        <p v-if="dish.recipe" class="detail__recipe">
          {{ dish.recipe }}
        </p>
      </div>

      <!-- Ingredients -->
      <div v-if="dish.dish_ingredients?.length" class="detail__section">
        <span class="detail__label">Состав</span>
        <ul class="detail__ingredients">
          <li v-for="di in dish.dish_ingredients" :key="di.id" class="detail__ingredient">
            <span class="detail__ingredient-name">{{ di.ingredient?.name ?? di.name }}</span>
            <span v-if="di.is_optional" class="detail__ingredient-optional">опц.</span>
            <span class="detail__ingredient-amount">
              {{ formatShoppingAmount(di.amount, di.ingredient?.base_unit ?? di.base_unit).display }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Type-specific info -->
      <div v-if="type === 'cooking'" class="detail__section">
        <div class="detail__row">
          <span class="detail__label">Дата готовки</span>
          <span class="detail__value">{{ formatDate(item.cooking_date) }}</span>
        </div>
        <div class="detail__row detail__row--col">
          <span class="detail__label">Дни еды</span>
          <div v-if="eatDates.length" class="detail__eat-dates">
            <span v-for="d in eatDates" :key="d" class="detail__eat-date">{{ formatDate(d) }}</span>
          </div>
          <span v-else class="detail__value detail__value--muted">Нет запланированных дней</span>
        </div>
        <div v-if="item.notes" class="detail__row detail__row--col">
          <span class="detail__label">Комментарий</span>
          <span class="detail__value">{{ item.notes }}</span>
        </div>
      </div>

      <div v-if="type === 'meal'" class="detail__section">
        <div class="detail__row">
          <span class="detail__label">Дата</span>
          <span class="detail__value">{{ formatDate(item.date) }}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">Источник</span>
          <button
            v-if="item.cooking_event"
            type="button"
            class="detail__link"
            @click="$emit('view-cooking', item.cooking_event)"
          >
            Из готовки →
          </button>
          <span v-else class="detail__value detail__value--muted">Ручной ввод</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <button class="detail__btn detail__btn--edit" @click="$emit('edit')">
          Редактировать
        </button>
        <button class="detail__btn detail__btn--delete" @click="confirming = true">
          Удалить
        </button>
        <button class="detail__btn detail__btn--cancel" @click="open = false">
          Отмена
        </button>
      </div>
    </template>
  </ModalWrapper>

  <!-- Delete confirmation modal -->
  <ModalWrapper v-model="confirming" title="Подтверждение" :z-index="1050">
    <p class="detail__confirm-text">Удалить этот элемент?</p>
    <template #footer>
      <div class="detail__confirm-actions">
        <button class="detail__btn detail__btn--delete" @click="confirming = false; open = false; $emit('delete')">
          Да, удаляем
        </button>
        <button class="detail__btn detail__btn--cancel" @click="confirming = false">
          Нет
        </button>
      </div>
    </template>
  </ModalWrapper>

  <DishForm
    v-model="showDishForm"
    :z-index="1020"
    :edit-dish="dish"
    @updated="onDishUpdated"
  />

  <!-- Clone confirmation modal -->
  <ModalWrapper v-model="showCloneConfirm" title="Общее блюдо" :z-index="1050">
    <p class="detail__clone-text">
      Это общее блюдо, его нельзя редактировать.
      Вы можете создать личную копию и настроить её под себя.
    </p>
    <template #footer>
      <div class="detail__confirm-actions">
        <button class="detail__btn detail__btn--edit" @click="startClone">
          Создать копию
        </button>
        <button class="detail__btn detail__btn--cancel" @click="showCloneConfirm = false">
          Отмена
        </button>
      </div>
    </template>
  </ModalWrapper>

  <!-- Clone DishForm -->
  <DishForm
    v-model="showCloneForm"
    :z-index="1020"
    :clone-dish="dish"
    @created="onCloneCreated"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./forms/ModalWrapper.vue"
import DishForm from "./forms/DishForm.vue"
import IconPencil from "./icons/IconPencil.vue"
import OwnershipBadge from "./OwnershipBadge.vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { formatAmount } from "../utils/formatAmount"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { usePlanningStore } from "../store/planning"
import { isDishOwn } from "../utils/dishOwnership"

const UNIT_LABELS = {
  gram: "г",
  kilogram: "кг",
  milliliter: "мл",
  liter: "л",
  piece: "шт",
  tablespoon: "ст. л.",
  teaspoon: "ч. л.",
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  item: { type: Object, default: null },
  type: { type: String, default: "cooking" }, // 'cooking' | 'meal'
})

const emit = defineEmits(["update:modelValue", "edit", "delete", "view-cooking"])

const planning = usePlanningStore()

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const confirming = ref(false)
const showDishForm = ref(false)
const showCloneConfirm = ref(false)
const showCloneForm = ref(false)

const isOwn = computed(() => isDishOwn(dish.value))

watch(() => props.modelValue, (v) => {
  if (v) {
    confirming.value = false
    showCloneConfirm.value = false
  }
})

const dish = computed(() => props.item?.dish ?? {})

const eatDates = computed(() => {
  const items = props.item?.meal_plan_items || []
  return items.map((m) => m.date).sort()
})

const title = computed(() => {
  if (props.type === "cooking") return "Готовка"
  return "Приём пищи"
})

function formatDate(iso) {
  return formatYMDtoDDMMYYYY(iso)
}

function unitLabel(unit) {
  return UNIT_LABELS[unit] || unit || ""
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
    showCloneConfirm.value = true
  }
}

function startClone() {
  showCloneConfirm.value = false
  showCloneForm.value = true
}

async function onCloneCreated() {
  showCloneForm.value = false
  await planning.loadWeek()
  open.value = false
}
</script>

<style>
@import '../styles/detail-sheet.css';
</style>

<style scoped>
.detail__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.detail__row--col {
  flex-direction: column;
  align-items: flex-start;
}

.detail__eat-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail__eat-date {
  font-size: var(--font-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
}

.detail__link {
  border: none;
  background: none;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-mint);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color var(--transition-fast), text-decoration-thickness var(--transition-fast);
}

.detail__link:hover {
  color: var(--color-mint-hover);
  text-decoration-thickness: 2px;
}

.detail__value {
  font-size: var(--font-base);
  font-weight: 500;
  color: var(--color-text);
}

.detail__value--muted {
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: var(--font-sm);
}
</style>
