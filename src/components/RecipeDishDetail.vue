<template>
  <ModalWrapper v-model="open" :title="'Рецепт'" :z-index="990">
    <div class="detail">
      <!-- Dish info -->
      <div class="detail__section">
        <div class="detail__dish-header">
          <div class="detail__dish-title-row">
            <h4 class="detail__dish-name">{{ dish.name }}</h4>
            <OwnershipBadge :is-own="isOwn" />
          </div>
        </div>
        <p v-if="dish.category?.name" class="detail__meta">{{ dish.category.name }}</p>
        <p v-if="dish.recipe" class="detail__recipe">{{ dish.recipe }}</p>
      </div>

      <!-- Ingredients -->
      <div v-if="dish.dish_ingredients?.length" class="detail__section">
        <span class="detail__label">Состав</span>
        <ul class="detail__ingredients">
          <li v-for="di in dish.dish_ingredients" :key="di.id" class="detail__ingredient">
            <span class="detail__ingredient-name">{{ di.ingredient?.name ?? di.name }}</span>
            <span class="detail__ingredient-right">
              <span v-if="di.is_optional" class="detail__ingredient-optional">опц.</span>
              <span class="detail__ingredient-amount">
                {{ formatShoppingAmount(di.amount, di.ingredient?.base_unit ?? di.base_unit).display }}
              </span>
            </span>
          </li>
        </ul>
      </div>

      <!-- Loading state for full dish data -->
      <div v-if="loadingFull" class="detail__loading"><div class="spinner spinner--sm" /></div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <button class="detail__btn detail__btn--edit" @click="handleDishEdit">
          {{ isOwn ? 'Редактировать рецепт' : 'Создать личную копию' }}
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
        Удалить
      </button>
      <button class="detail__btn detail__btn--cancel" @click="confirming = false">
        Отмена
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
import OwnershipBadge from "./OwnershipBadge.vue"
import { fetchDish } from "../services/dishService"
import { formatAmount } from "../utils/formatAmount"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { isDishOwn } from "../utils/dishOwnership"
import { UNIT_LABELS } from "../utils/unitLabels"

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
    showCloneForm.value = true
  }
}

function confirmDelete() {
  confirming.value = false
  open.value = false
  emit("deleted", dish.value.id)
}

function onDishUpdated(updatedDish) {
  showDishForm.value = false
  if (updatedDish) fullDish.value = updatedDish
  emit("updated")
}

function onCloneCreated() {
  showCloneForm.value = false
  open.value = false
  emit("updated")
}
</script>

<style>
@import '../styles/detail-sheet.css';
</style>

<style scoped>
.detail__loading {
  text-align: center;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  padding: 12px 0;
}
</style>
