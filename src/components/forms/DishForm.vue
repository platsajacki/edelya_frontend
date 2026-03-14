<template>
  <ModalWrapper v-model="open" title="Новое блюдо" :z-index="zIndex">
    <form class="form" @submit.prevent="submit">
      <label class="form__field">
        <span class="form__label">Название</span>
        <input v-model="name" type="text" class="form__input" required />
      </label>

      <label class="form__field">
        <span class="form__label">Категория</span>
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
        <span class="form__label">Ингредиенты</span>

        <div v-for="(ing, idx) in ingredients" :key="idx" class="ingredient-row">
          <span class="ingredient-row__name">{{ ing.ingredientName }}</span>
          <span class="ingredient-row__amount">{{ ing.amount }}</span>
          <button type="button" class="ingredient-row__remove" @click="ingredients.splice(idx, 1)">&times;</button>
        </div>

        <!-- Ingredient search -->
        <div v-if="showIngredientSearch" class="ingredient-search">
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
              <span class="ingredient-search__unit">{{ ing.base_unit }}</span>
            </li>
          </ul>
          <button type="button" class="dish-search__create" @click="showIngredientForm = true">
            + Создать ингредиент
          </button>
        </div>

        <!-- Amount input after selecting ingredient -->
        <div v-if="pendingIngredient" class="ingredient-amount">
          <span class="ingredient-amount__name">{{ pendingIngredient.name }}</span>
          <input
            v-model="pendingAmount"
            type="number"
            step="0.001"
            min="0"
            class="form__input ingredient-amount__input"
            placeholder="Количество"
            @keydown.enter.prevent="confirmIngredient"
          />
          <label class="ingredient-amount__optional">
            <input v-model="pendingOptional" type="checkbox" />
            Опционально
          </label>
          <div class="ingredient-amount__actions">
            <button type="button" class="btn btn--sm" @click="confirmIngredient">Добавить</button>
            <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredient">Отмена</button>
          </div>
        </div>

        <button
          v-if="!showIngredientSearch && !pendingIngredient"
          type="button"
          class="dish-search__create"
          @click="showIngredientSearch = true"
        >
          + Добавить ингредиент
        </button>
      </div>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : "Создать блюдо" }}
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
import { ref, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import { createDish, fetchDishCategories } from "../../services/dishService"
import { fetchIngredients } from "../../services/ingredientService"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  zIndex: { type: Number, default: 1010 },
})

const emit = defineEmits(["update:modelValue", "created"])

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
const showIngredientSearch = ref(false)
const ingredientQuery = ref("")
const ingredientResults = ref([])
const showIngredientForm = ref(false)

// Pending ingredient (selected but not yet confirmed with amount)
const pendingIngredient = ref(null)
const pendingAmount = ref("")
const pendingOptional = ref(false)

let ingredientSearchTimer = null

watch(() => props.modelValue, async (v) => {
  if (v) {
    error.value = ""
    name.value = ""
    categoryId.value = ""
    description.value = ""
    ingredients.value = []
    resetIngredientSearch()
    try {
      const data = await fetchDishCategories()
      categories.value = data.results ?? []
    } catch {
      categories.value = []
    }
  }
})

function resetIngredientSearch() {
  showIngredientSearch.value = false
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
  showIngredientSearch.value = false
}

function confirmIngredient() {
  if (!pendingIngredient.value || !pendingAmount.value) return
  ingredients.value.push({
    ingredient: pendingIngredient.value.id,
    ingredientName: pendingIngredient.value.name,
    amount: String(pendingAmount.value),
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
    const dish = await createDish(payload)
    emit("created", dish)
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
  gap: 14px;
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
}

.form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form__input,
.form__select,
.form__textarea {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
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
}

.form__error {
  font-size: 13px;
  color: #e53e3e;
  padding: 4px 0;
}

.form__submit {
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  transition: background 0.15s;
}

.form__submit:hover:not(:disabled) {
  background: var(--color-mint-hover);
}

.form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Ingredient rows */
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--color-empty);
  border-radius: 8px;
  font-size: 14px;
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
  font-size: 18px;
  color: var(--color-text-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ingredient-row__remove:hover {
  background: var(--color-border);
  color: #e53e3e;
}

/* Ingredient search */
.ingredient-search {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-size: 14px;
  transition: background 0.1s;
}

.ingredient-search__item:hover {
  background: var(--color-empty);
}

.ingredient-search__item + .ingredient-search__item {
  border-top: 1px solid var(--color-border);
}

.ingredient-search__unit {
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* Pending ingredient amount */
.ingredient-amount {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--color-empty);
  border-radius: 8px;
}

.ingredient-amount__name {
  font-size: 14px;
  font-weight: 500;
}

.ingredient-amount__input {
  width: 120px;
}

.ingredient-amount__optional {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.ingredient-amount__actions {
  display: flex;
  gap: 8px;
}

/* Buttons */
.btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn--sm {
  background: var(--color-mint);
  color: #fff;
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
  padding: 8px 14px;
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
