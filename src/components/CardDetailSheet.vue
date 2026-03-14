<template>
  <ModalWrapper v-model="open" :title="title" :z-index="990">
    <div class="detail">
      <!-- Dish info -->
      <div class="detail__section">
        <div class="detail__dish-header">
          <h4 class="detail__dish-name">{{ dish.name }}</h4>
          <button type="button" class="detail__dish-edit" title="Редактировать блюдо" @click="showDishForm = true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5a1.414 1.414 0 012 2L5.5 12.5l-3 1 1-3 8-8z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <p v-if="dish.category?.name" class="detail__meta">
          {{ dish.category.name }}
        </p>
        <p v-if="dish.description" class="detail__description">
          {{ dish.description }}
        </p>
      </div>

      <!-- Ingredients -->
      <div v-if="dish.dish_ingredients?.length" class="detail__section">
        <span class="detail__label">Ингредиенты</span>
        <ul class="detail__ingredients">
          <li v-for="di in dish.dish_ingredients" :key="di.id" class="detail__ingredient">
            <span class="detail__ingredient-name">{{ di.ingredient?.name ?? di.name }}</span>
            <span class="detail__ingredient-amount">
              {{ di.amount }} {{ unitLabel(di.ingredient?.base_unit ?? di.base_unit) }}
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
        <div class="detail__row">
          <span class="detail__label">На сколько дней</span>
          <span class="detail__value">{{ item.duration_days }}</span>
        </div>
        <div class="detail__row">
          <span class="detail__label">Начало еды</span>
          <span class="detail__value">{{ formatDate(item.start_eating_date) }}</span>
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
        <div v-if="item.cooking_event" class="detail__row">
          <span class="detail__label">Источник</span>
          <span class="detail__value detail__value--muted">Из готовки</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <button class="detail__btn detail__btn--edit" @click="$emit('edit')">
          Редактировать
        </button>
        <button class="detail__btn detail__btn--delete" @click="confirmDelete">
          Удалить
        </button>
        <button class="detail__btn detail__btn--cancel" @click="open = false">
          Отмена
        </button>
      </div>

      <!-- Delete confirmation -->
      <Transition name="confirm">
        <div v-if="confirming" class="detail__confirm">
          <p class="detail__confirm-text">Удаляем?</p>
          <div class="detail__confirm-actions">
            <button class="detail__btn detail__btn--delete" @click="$emit('delete')">
              Да, удаляем
            </button>
            <button class="detail__btn detail__btn--cancel" @click="confirming = false">
              Нет
            </button>
          </div>
        </div>
      </Transition>
    </template>
  </ModalWrapper>

  <DishForm
    v-model="showDishForm"
    :z-index="1020"
    :edit-dish="dish"
    @updated="onDishUpdated"
  />
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./forms/ModalWrapper.vue"
import DishForm from "./forms/DishForm.vue"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import { usePlanningStore } from "../store/planning"

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

const emit = defineEmits(["update:modelValue", "edit", "delete"])

const planning = usePlanningStore()

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const confirming = ref(false)
const showDishForm = ref(false)

watch(() => props.modelValue, (v) => {
  if (v) confirming.value = false
})

const dish = computed(() => props.item?.dish ?? {})

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

function confirmDelete() {
  confirming.value = true
}

async function onDishUpdated() {
  showDishForm.value = false
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
  gap: 8px;
}

.detail__section + .detail__section {
  padding-top: 12px;
  border-top: 1px solid var(--color-border);
}

.detail__dish-name {
  font-size: 18px;
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

.detail__description {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
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
  padding: 6px 10px;
  background: var(--color-empty);
  border-radius: var(--radius-sm);
  font-size: 14px;
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
  background: var(--color-danger-bg);
  color: var(--color-danger-muted);
}

  .detail__btn--delete:hover {
  background: var(--color-danger-soft);
}

.detail__btn--cancel {
  background: var(--color-empty);
  color: var(--color-text-secondary);
}

.detail__btn--cancel:hover {
  background: var(--color-border);
}

  .detail__confirm {
  margin-top: 12px;
  padding: 14px;
  background: var(--color-danger-pale);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-danger-soft);
}

  .detail__confirm-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-danger-muted);
  text-align: center;
  margin: 0 0 10px;
}

.detail__confirm-actions {
  display: flex;
  gap: 8px;
}

.detail__confirm-actions .detail__btn {
  flex: 1;
}

/* Confirm transition */
.confirm-enter-active,
.confirm-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.confirm-enter-from,
.confirm-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
