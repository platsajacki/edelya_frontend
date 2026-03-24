<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать блюдо' : isClone ? 'Создать личную копию' : 'Новое блюдо'" :z-index="zIndex">
    <form class="form" @submit.prevent="submit">
      <label class="form__field">
        <span class="form__label">Название <span class="form__required">*</span></span>
        <input v-model="name" type="text" class="form__input" required />
      </label>

      <label class="form__field">
        <span class="form__label">Категория <span class="form__required">*</span></span>
        <select v-model="categoryId" class="form__select" required>
          <option value="" disabled>Выберите категорию</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </label>

      <label class="form__field">
        <span class="form__label">Описание</span>
        <textarea v-model="description" class="form__textarea" rows="2" />
      </label>

      <!-- Ingredients -->
      <div class="form__section">
        <span class="form__label">Ингредиенты <span class="form__required">*</span></span>

        <div v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
          <span class="ingredient-row__name">{{ ing.ingredientName }}</span>
          <span class="ingredient-row__amount">{{ formatAmount(ing.amount) }} {{ ing.unitLabel || '' }}</span>
          <button type="button" class="ingredient-row__remove" @click="ingredients.splice(idx, 1)" title="Удалить">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>

        <!-- Amount input after selecting ingredient -->
        <div v-if="pendingIngredient" class="ingredient-amount">
          <span class="ingredient-amount__name">{{ pendingIngredient.name }}</span>
          <div class="ingredient-amount__row">
            <input
              v-model="pendingAmount"
              type="number"
              step="0.001"
              min="0.001"
              class="form__input ingredient-amount__input"
              placeholder="Количество"
              @keydown.enter.prevent="confirmIngredient"
            />
            <span class="ingredient-amount__unit">{{ UNIT_LABELS[pendingIngredient.base_unit] || pendingIngredient.base_unit }}</span>
          </div>
          <label class="ingredient-amount__optional">
            <input v-model="pendingOptional" type="checkbox" />
            Опционально
          </label>
          <div v-if="amountError" class="form__error">{{ amountError }}</div>
          <div class="ingredient-amount__actions">
            <button type="button" class="btn btn--sm" @click="confirmIngredient">Добавить</button>
            <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredient">Отмена</button>
          </div>
        </div>

        <!-- Ingredient search (always visible when no pending ingredient) -->
        <div v-else class="ingredient-search">
          <input
            v-model="ingredientQuery"
            type="text"
            class="form__input"
            placeholder="Поиск ингредиента..."
            @input="searchIngredients"
          />
          <ul v-if="ingredientResults.length" class="ingredient-search__list">
            <li
              v-for="ing in ingredientResults"
              :key="ing.id"
              class="ingredient-search__item"
              @click="selectIngredient(ing)"
            >
              {{ ing.name }}
              <span class="ingredient-search__unit">{{ UNIT_LABELS[ing.base_unit] || ing.base_unit }}</span>
            </li>
          </ul>
          <button type="button" class="dish-search__create" @click="showIngredientForm = true">
            + Создать ингредиент
          </button>
        </div>
      </div>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать блюдо") }}
      </button>
    </form>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      @created="onIngredientCreated"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import { createDish, updateDish, fetchDishCategories } from "../../services/dishService"
import { fetchIngredients } from "../../services/ingredientService"
import { formatAmount } from "../../utils/formatAmount"

const UNIT_LABELS = {
  gram: "г",
  kilogram: "кг",
  milligram: "мг",
  liter: "л",
  milliliter: "мл",
  piece: "шт",
  slice: "ломт.",
  teaspoon: "ч.л.",
  tablespoon: "ст.л.",
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
  zIndex: { type: Number, default: 1010 },
  editDish: { type: Object, default: null },
  cloneDish: { type: Object, default: null },
  initialName: { type: String, default: "" },
})

const emit = defineEmits(["update:modelValue", "created", "updated"])

const isEdit = computed(() => !!props.editDish)
const isClone = computed(() => !props.editDish && !!props.cloneDish)

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const name = ref("")
const categoryId = ref("")
const description = ref("")
const categories = ref([])
const ingredients = ref([])
const saving = ref(false)
const error = ref("")

// Ingredient search state
const ingredientQuery = ref("")
const ingredientResults = ref([])
const showIngredientForm = ref(false)

// Pending ingredient (selected but not yet confirmed with amount)
const pendingIngredient = ref(null)
const pendingAmount = ref("")
const pendingOptional = ref(false)
const amountError = ref("")

let ingredientSearchTimer = null

watch(() => props.modelValue, async (v) => {
  if (v) {
    error.value = ""
    resetIngredientSearch()
    try {
      const data = await fetchDishCategories()
      categories.value = data.results ?? []
    } catch {
      categories.value = []
    }
    if (props.editDish) {
      name.value = props.editDish.name || ""
      categoryId.value = props.editDish.category?.id || ""
      description.value = props.editDish.description || ""
      ingredients.value = (props.editDish.dish_ingredients || []).map((di) => ({
        ingredient: di.ingredient?.id ?? di.ingredient,
        ingredientName: di.ingredient?.name ?? di.name ?? "",
        amount: formatAmount(di.amount),
        unitLabel: UNIT_LABELS[di.ingredient?.base_unit] || di.ingredient?.base_unit || '',
        is_optional: di.is_optional ?? false,
      }))
    } else if (props.cloneDish) {
      name.value = props.cloneDish.name || ""
      categoryId.value = props.cloneDish.category?.id || ""
      description.value = props.cloneDish.description || ""
      ingredients.value = (props.cloneDish.dish_ingredients || []).map((di) => ({
        ingredient: di.ingredient?.id ?? di.ingredient,
        ingredientName: di.ingredient?.name ?? di.name ?? "",
        amount: formatAmount(di.amount),
        unitLabel: UNIT_LABELS[di.ingredient?.base_unit] || di.ingredient?.base_unit || '',
        is_optional: di.is_optional ?? false,
      }))
    } else {
      name.value = props.initialName || ""
      categoryId.value = ""
      description.value = ""
      ingredients.value = []
    }
  }
})

function resetIngredientSearch() {
  ingredientQuery.value = ""
  ingredientResults.value = []
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
}

function searchIngredients() {
  clearTimeout(ingredientSearchTimer)
  const q = ingredientQuery.value.trim()
  if (!q) {
    ingredientResults.value = []
    return
  }
  ingredientSearchTimer = setTimeout(async () => {
    try {
      const data = await fetchIngredients({ name__icontains: q })
      ingredientResults.value = data.results ?? []
    } catch {
      ingredientResults.value = []
    }
  }, 300)
}

function selectIngredient(ing) {
  pendingIngredient.value = ing
  ingredientQuery.value = ""
  ingredientResults.value = []
}

function confirmIngredient() {
  if (!pendingIngredient.value || !pendingAmount.value) return
  const num = Number(pendingAmount.value)
  if (!num || num <= 0) {
    amountError.value = "Количество должно быть больше 0."
    return
  }
  amountError.value = ""
  ingredients.value.push({
    ingredient: pendingIngredient.value.id,
    ingredientName: pendingIngredient.value.name,
    amount: String(pendingAmount.value),
    unitLabel: UNIT_LABELS[pendingIngredient.value.base_unit] || pendingIngredient.value.base_unit || '',
    is_optional: pendingOptional.value,
  })
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
}

function cancelIngredient() {
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
  amountError.value = ""
}

function onIngredientCreated(ingredient) {
  selectIngredient(ingredient)
}

function validate() {
  if (!name.value.trim()) return "Укажите название блюда."
  if (!categoryId.value) return "Выберите категорию."
  if (!ingredients.value.length) return "Добавьте хотя бы один ингредиент."
  const ids = ingredients.value.map((i) => i.ingredient)
  if (new Set(ids).size !== ids.length) return "Ингредиенты не должны повторяться."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    const payload = {
      name: name.value.trim(),
      category: categoryId.value,
    }
    if (description.value.trim()) {
      payload.description = description.value.trim()
    }
    if (ingredients.value.length) {
      payload.dish_ingredients = ingredients.value.map((i) => ({
        ingredient: i.ingredient,
        amount: i.amount,
        is_optional: i.is_optional,
      }))
    }
    if (isEdit.value) {
      const dish = await updateDish(props.editDish.id, payload)
      emit("updated", dish)
    } else {
      const dish = await createDish(payload)
      emit("created", dish)
    }
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось создать блюдо"
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.form__input,
.form__select,
.form__textarea {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}

.form__input:focus,
.form__select:focus,
.form__textarea:focus {
  border-color: var(--color-mint);
  outline: none;
}

.form__error {
  font-size: 13px;
  color: var(--color-danger);
  padding: 4px 0;
}

.form__submit {
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: 15px;
  font-weight: 600;
  transition: background 0.15s;
}

.form__submit:hover:not(:disabled) {
  background: var(--color-mint-hover);
}

.form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Ingredient rows */
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-empty);
  border-radius: 8px;
  font-size: 13px;
}

.ingredient-row__name {
  flex: 1;
  font-weight: 500;
}

.ingredient-row__amount {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.ingredient-row__remove {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.ingredient-row__remove:hover {
  background: var(--color-border);
  color: var(--color-danger);
}

/* Ingredient search */
.ingredient-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ingredient-search__list {
  list-style: none;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.ingredient-search__item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.1s;
}

.ingredient-search__item:hover {
  background: var(--color-empty);
}

.ingredient-search__item + .ingredient-search__item {
  border-top: 1px solid var(--color-border);
}

.ingredient-search__unit {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Pending ingredient amount */
.ingredient-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-empty);
  border-radius: 8px;
}

.ingredient-amount__name {
  font-size: 13px;
  font-weight: 500;
}

.ingredient-amount__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ingredient-amount__input {
  width: 120px;
}

.ingredient-amount__unit {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ingredient-amount__optional {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.ingredient-amount__actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn--sm {
  background: var(--color-mint);
  color: var(--on-primary);
}

.btn--sm:hover {
  background: var(--color-mint-hover);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}

.btn--ghost:hover {
  background: var(--color-empty);
}

.dish-search__create {
  align-self: flex-start;
  padding: 8px 16px;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-mint-hover);
  transition: background 0.15s, border-color 0.15s;
}

.dish-search__create:hover {
  background: var(--color-empty);
  border-color: var(--color-mint);
}
</style>
