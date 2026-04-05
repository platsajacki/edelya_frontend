<template>
  <ModalWrapper v-model="open" :title="title" :z-index="990">
    <div class="detail">
      <!-- Dish info -->
      <div class="detail__section">
        <div class="detail__dish-header">
          <div class="detail__dish-title-row">
            <h4 class="detail__dish-name">{{ dish.name }}</h4>
            <span
              class="detail__ownership-badge"
              :class="isOwn ? 'detail__ownership-badge--own' : 'detail__ownership-badge--shared'"
            >
              {{ isOwn ? '👤 Личный рецепт' : '🌐 Общий рецепт' }}
            </span>
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
            <span class="detail__ingredient-amount">
              {{ formatShoppingAmount(di.amount, di.ingredient?.base_unit ?? di.base_unit).display }}
            </span>
            <span v-if="di.is_optional" class="detail__ingredient-optional">опц.</span>
          </li>
        </ul>
      </div>

      <!-- Type-specific info -->
      <div v-if="type === 'cooking'" class="detail__section">
        <span class="detail__label">Планирование</span>
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
        <span class="detail__label">Планирование</span>
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
    <div class="detail__confirm-actions">
      <button class="detail__btn detail__btn--delete" @click="confirming = false; open = false; $emit('delete')">
        Да, удаляем
      </button>
      <button class="detail__btn detail__btn--cancel" @click="confirming = false">
        Нет
      </button>
    </div>
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
    <div class="detail__confirm-actions">
      <button class="detail__btn detail__btn--edit" @click="startClone">
        Создать копию
      </button>
      <button class="detail__btn detail__btn--cancel" @click="showCloneConfirm = false">
        Отмена
      </button>
    </div>
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

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail__section + .detail__section {
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.detail__dish-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.detail__dish-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.detail__dish-title-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.detail__ownership-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  width: fit-content;
}

.detail__ownership-badge--own {
  background: rgba(138, 99, 181, 0.12);
  color: var(--color-mint);
}

.detail__ownership-badge--shared {
  background: var(--color-shared-bg);
  color: var(--color-shared);
}

.detail__dish-edit {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: 8px;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.detail__dish-edit:hover {
  background: var(--color-empty);
  color: var(--color-mint);
}

.detail__meta {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.detail__recipe {
  font-size: 15px;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
  white-space: pre-line;
}

.detail__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.detail__ingredients {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail__ingredient {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--color-border);
  border-radius: 8px;
  font-size: 13px;
}

.detail__ingredient-name {
  font-weight: 500;
  color: var(--color-text);
}

.detail__ingredient-amount {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.detail__ingredient-optional {
  font-size: 11px;
  color: var(--color-mint);
  background: color-mix(in srgb, var(--color-mint) 12%, transparent);
  border-radius: 4px;
  padding: 1px 5px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

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
  padding: 4px 12px;
  background: var(--color-empty);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.detail__link {
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-mint);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: color 0.15s, text-decoration-thickness 0.15s;
}

.detail__link:hover {
  color: var(--color-mint-hover);
  text-decoration-thickness: 2px;
}

.detail__value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.detail__value--muted {
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: 13px;
}

.detail__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail__btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 600;
  transition: background 0.15s, opacity 0.15s;
}

.detail__btn--edit {
  background: var(--color-mint);
  color: var(--on-primary);
}

.detail__btn--edit:hover {
  background: var(--color-mint-hover);
}

.detail__btn--delete {
  background: var(--color-danger-pale);
  color: var(--color-danger-muted);
}

.detail__btn--delete:hover {
  background: var(--color-danger-bg);
}

.detail__btn--cancel {
  background: var(--color-empty);
  color: var(--color-text-secondary);
}

.detail__btn--cancel:hover {
  background: var(--color-border);
}

.detail__confirm-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-danger-muted);
  text-align: center;
  margin: 0 0 12px;
}

.detail__confirm-actions {
  display: flex;
  gap: 8px;
}

.detail__confirm-actions .detail__btn {
  flex: 1;
}

.detail__clone-text {
  font-size: 13px;
  color: var(--color-text);
  line-height: 1.5;
  text-align: center;
  margin: 0 0 12px;
}
</style>
