<template>
  <ModalWrapper v-model="open" :title="dish.name || 'Блюдо'" :z-index="990">
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
          <button
            type="button"
            class="detail__dish-edit"
            :title="isOwn ? 'Редактировать блюдо' : 'Создать копию'"
            @click="handleDishEdit"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5a1.414 1.414 0 012 2L5.5 12.5l-3 1 1-3 8-8z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
        <p v-if="dish.category?.name" class="detail__meta">{{ dish.category.name }}</p>
        <p v-if="dish.description" class="detail__description">{{ dish.description }}</p>
      </div>

      <!-- Ingredients -->
      <div v-if="dish.dish_ingredients?.length" class="detail__section">
        <span class="detail__label">Состав</span>
        <ul class="detail__ingredients">
          <li v-for="di in dish.dish_ingredients" :key="di.id" class="detail__ingredient">
            <span class="detail__ingredient-name">{{ di.ingredient?.name ?? di.name }}</span>
            <span class="detail__ingredient-amount">
              {{ di.amount }} {{ unitLabel(di.ingredient?.base_unit ?? di.base_unit) }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Loading state for full dish data -->
      <div v-if="loadingFull" class="detail__loading">Загрузка...</div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <button class="detail__btn detail__btn--edit" @click="handleDishEdit">
          {{ isOwn ? 'Редактировать' : 'Создать копию' }}
        </button>
        <button v-if="isOwn" class="detail__btn detail__btn--delete" @click="confirming = true">
          Удалить
        </button>
        <button class="detail__btn detail__btn--cancel" @click="open = false">
          Закрыть
        </button>
      </div>
    </template>
  </ModalWrapper>

  <!-- Delete confirmation -->
  <ModalWrapper v-model="confirming" title="Подтверждение" :z-index="1050">
    <p class="detail__confirm-text">Удалить блюдо «{{ dish.name }}»?</p>
    <div class="detail__confirm-actions">
      <button class="detail__btn detail__btn--delete" @click="confirmDelete">
        Да, удаляем
      </button>
      <button class="detail__btn detail__btn--cancel" @click="confirming = false">
        Нет
      </button>
    </div>
  </ModalWrapper>

  <!-- Edit DishForm (own dishes) -->
  <DishForm
    v-model="showDishForm"
    :z-index="1020"
    :edit-dish="dish"
    @updated="onDishUpdated"
  />

  <!-- Clone confirmation -->
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
import { fetchDish } from "../services/dishService"
import { isDishOwn } from "../utils/dishOwnership"

const UNIT_LABELS = {
  gram: "г",
  kilogram: "кг",
  milligram: "мг",
  milliliter: "мл",
  liter: "л",
  piece: "шт",
  slice: "ломт.",
  teaspoon: "ч. л.",
  tablespoon: "ст. л.",
  glass: "стак.",
  cup: "чашка",
  bunch: "пучок",
  can: "банка",
  pinch: "щеп.",
  clove: "зубч.",
  to_taste: "по вкусу",
}

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  dish: { type: Object, default: () => ({}) },
})

const emit = defineEmits(["update:modelValue", "deleted", "updated"])

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const confirming = ref(false)
const showDishForm = ref(false)
const showCloneConfirm = ref(false)
const showCloneForm = ref(false)
const loadingFull = ref(false)
const fullDish = ref(null)

const isOwn = computed(() => isDishOwn(dish.value))

const dish = computed(() => fullDish.value || props.dish)

// When opening, fetch full dish data if ingredients are missing
watch(() => props.modelValue, async (v) => {
  if (v) {
    confirming.value = false
    showCloneConfirm.value = false
    fullDish.value = null

    if (!props.dish.dish_ingredients?.length && props.dish.id) {
      loadingFull.value = true
      try {
        fullDish.value = await fetchDish(props.dish.id)
      } catch {
        // Use partial data
      } finally {
        loadingFull.value = false
      }
    }
  }
})

function unitLabel(unit) {
  return UNIT_LABELS[unit] || unit || ""
}

function handleDishEdit() {
  if (isOwn.value) {
    showDishForm.value = true
  } else {
    showCloneConfirm.value = true
  }
}

function confirmDelete() {
  confirming.value = false
  open.value = false
  emit("deleted", dish.value.id)
}

function onDishUpdated() {
  showDishForm.value = false
  open.value = false
  emit("updated")
}

function startClone() {
  showCloneConfirm.value = false
  showCloneForm.value = true
}

function onCloneCreated() {
  showCloneForm.value = false
  open.value = false
  emit("updated")
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

.detail__dish-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
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

.detail__description {
  font-size: 15px;
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

.detail__loading {
  text-align: center;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  padding: 12px 0;
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
