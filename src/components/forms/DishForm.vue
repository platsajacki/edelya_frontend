<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать блюдо' : isClone ? 'Создать личную копию' : 'Новое блюдо'" :z-index="zIndex">
    <form id="dish-form" class="form" @submit.prevent="submit">
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
        <span class="form__label">Рецепт</span>
        <textarea v-model="recipe" class="form__textarea" rows="2" />
      </label>

      <!-- Ingredients -->
      <div class="form__section">
        <span class="form__label">Ингредиенты <span class="form__required">*</span></span>

        <template v-for="(ing, idx) in ingredients" :key="idx">
          <!-- Edit form appears in place of the row -->
          <div v-if="editingIdx === idx && pendingIngredient" class="ingredient-amount">
            <div class="ingredient-amount__header">
              <span class="ingredient-amount__name">{{ pendingIngredient.name }}</span>
              <span class="ingredient-amount__mode">Редактирование</span>
            </div>
            <div v-if="pendingIngredient.base_unit !== 'to_taste'" class="ingredient-amount__row">
              <input
                v-model="pendingAmount"
                type="text"
                inputmode="decimal"
                autocomplete="off"
                class="form__input ingredient-amount__input"
                placeholder="Например: 200"
                @focus="$event.target.select()"
                @keydown.enter.prevent="confirmIngredient"
              />
              <span class="ingredient-amount__unit">{{ UNIT_LABELS[pendingIngredient.base_unit] || pendingIngredient.base_unit }}</span>
            </div>
            <p v-else class="ingredient-amount__taste-hint">Количество не указывается — добавится как «по вкусу»</p>
            <label class="ingredient-amount__optional">
              <input v-model="pendingOptional" type="checkbox" />
              Опционально
            </label>
            <div v-if="amountError" class="form__error">{{ amountError }}</div>
            <div class="ingredient-amount__actions">
              <button type="button" class="btn btn--sm" @click="confirmIngredient">Сохранить</button>
              <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredient">Отмена</button>
            </div>
          </div>
          <!-- Normal row -->
          <div v-else class="ingredient-row" :class="{ 'ingredient-row--optional': ing.is_optional }">
            <span class="ingredient-row__name">{{ ing.ingredientName }}</span>
            <span v-if="ing.is_optional" class="ingredient-row__opt-label">опц.</span>
            <span class="ingredient-row__amount">{{ formatShoppingAmount(ing.amount, ing.base_unit).display }}</span>
            <button type="button" class="ingredient-row__edit" @click="startEditIngredient(idx)" title="Редактировать">
              <IconPencil width="14" height="14" />
            </button>
            <button type="button" class="ingredient-row__remove" @click="removeIngredient(idx)" title="Удалить">
              <IconClose />
            </button>
          </div>
        </template>

        <!-- Amount input when adding a new ingredient -->
        <div v-if="pendingIngredient && editingIdx === null" class="ingredient-amount">
          <div class="ingredient-amount__header">
            <span class="ingredient-amount__name">{{ pendingIngredient.name }}</span>
            <span class="ingredient-amount__mode">Добавление</span>
          </div>
          <div v-if="pendingIngredient.base_unit !== 'to_taste'" class="ingredient-amount__row">
            <input
              v-model="pendingAmount"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="form__input ingredient-amount__input"
              placeholder="Например: 200"
              @focus="$event.target.select()"
              @keydown.enter.prevent="confirmIngredient"
            />
            <span class="ingredient-amount__unit">{{ UNIT_LABELS[pendingIngredient.base_unit] || pendingIngredient.base_unit }}</span>
          </div>
          <p v-else class="ingredient-amount__taste-hint">Количество не указывается — добавится как «по вкусу»</p>
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
            type="search"
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

    </form>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      @created="onIngredientCreated"
    />

    <template #footer>
      <button type="submit" form="dish-form" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать блюдо") }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import IconPencil from "../icons/IconPencil.vue"
import IconClose from "../icons/IconClose.vue"
import { createDish, updateDish, fetchDishCategories } from "../../services/dishService"
import { fetchIngredients } from "../../services/ingredientService"
import { formatAmount } from "../../utils/formatAmount"
import { formatShoppingAmount } from "../../utils/formatShoppingAmount"

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
const recipe = ref("")
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
const editingIdx = ref(null)

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
      recipe.value = props.editDish.recipe || ""
      ingredients.value = (props.editDish.dish_ingredients || []).map((di) => ({
        ingredient: di.ingredient?.id ?? di.ingredient,
        ingredientName: di.ingredient?.name ?? di.name ?? "",
        amount: formatAmount(di.amount),
        base_unit: di.ingredient?.base_unit ?? '',
        unitLabel: UNIT_LABELS[di.ingredient?.base_unit] || di.ingredient?.base_unit || '',
        is_optional: di.is_optional ?? false,
      }))
    } else if (props.cloneDish) {
      name.value = props.cloneDish.name || ""
      categoryId.value = props.cloneDish.category?.id || ""
      recipe.value = props.cloneDish.recipe || ""
      ingredients.value = (props.cloneDish.dish_ingredients || []).map((di) => ({
        ingredient: di.ingredient?.id ?? di.ingredient,
        ingredientName: di.ingredient?.name ?? di.name ?? "",
        amount: formatAmount(di.amount),
        base_unit: di.ingredient?.base_unit ?? '',
        unitLabel: UNIT_LABELS[di.ingredient?.base_unit] || di.ingredient?.base_unit || '',
        is_optional: di.is_optional ?? false,
      }))
    } else {
      name.value = props.initialName || ""
      categoryId.value = ""
      recipe.value = ""
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
  editingIdx.value = null
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
  const alreadyAdded = ingredients.value.some(i => i.ingredient === ing.id)
  if (alreadyAdded) {
    amountError.value = "Ингредиент уже добавлен."
    return
  }
  pendingIngredient.value = ing
  ingredientQuery.value = ""
  ingredientResults.value = []
  amountError.value = ""
  editingIdx.value = null
}

function startEditIngredient(idx) {
  const ing = ingredients.value[idx]
  pendingIngredient.value = {
    id: ing.ingredient,
    name: ing.ingredientName,
    base_unit: ing.base_unit,
  }
  pendingAmount.value = ing.base_unit === 'to_taste' ? '' : formatAmount(ing.amount)
  pendingOptional.value = ing.is_optional
  editingIdx.value = idx
  amountError.value = ""
  ingredientQuery.value = ""
  ingredientResults.value = []
}

function removeIngredient(idx) {
  ingredients.value.splice(idx, 1)
  if (editingIdx.value === idx) {
    resetIngredientSearch()
  } else if (editingIdx.value !== null && editingIdx.value > idx) {
    editingIdx.value--
  }
}

function confirmIngredient() {
  if (!pendingIngredient.value) return
  const isToTaste = pendingIngredient.value.base_unit === 'to_taste'
  let finalAmount = "1"
  if (!isToTaste) {
    const raw = pendingAmount.value.trim().replace(',', '.')
    const num = Number(raw)
    if (!raw || isNaN(num) || num <= 0) {
      amountError.value = "Введите количество больше 0."
      return
    }
    finalAmount = String(num)
  }
  amountError.value = ""
  const row = {
    ingredient: pendingIngredient.value.id,
    ingredientName: pendingIngredient.value.name,
    amount: finalAmount,
    base_unit: pendingIngredient.value.base_unit,
    unitLabel: UNIT_LABELS[pendingIngredient.value.base_unit] || pendingIngredient.value.base_unit || '',
    is_optional: pendingOptional.value,
  }
  if (editingIdx.value !== null) {
    ingredients.value[editingIdx.value] = row
  } else {
    ingredients.value.push(row)
  }
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
  editingIdx.value = null
}

function cancelIngredient() {
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
  amountError.value = ""
  editingIdx.value = null
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
    if (recipe.value.trim()) {
      payload.recipe = recipe.value.trim()
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
.form__section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

/* Ingredient rows */
.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-sm);
}

.ingredient-row:last-of-type {
  border-bottom: none;
}

.ingredient-row--optional {
  opacity: 0.75;
}

.ingredient-row__name {
  flex: 1;
  font-weight: 500;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ingredient-row__amount {
  flex-shrink: 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ingredient-row__opt-label {
  font-size: var(--font-xs);
  color: var(--color-mint);
  background: var(--color-mint-alpha-12);
  border-radius: var(--radius-xs);
  padding: 1px 5px;
  font-weight: 500;
  white-space: nowrap;
}

.ingredient-row__edit,
.ingredient-row__remove {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.4;
  transition: opacity var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
  padding: 0;
}

.ingredient-row__edit:hover,
.ingredient-row:hover .ingredient-row__edit {
  opacity: 1;
  color: var(--color-mint);
  background: var(--color-mint-alpha-10);
}

.ingredient-row__remove:hover {
  opacity: 1;
  color: var(--color-danger);
  background: var(--color-danger-pale);
}

/* Ingredient search */

/* Pending ingredient amount */
.ingredient-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-empty);
  border-radius: var(--radius-xs);
  border: 1.5px solid var(--color-border);
}

.ingredient-amount__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ingredient-amount__name {
  font-size: var(--font-sm);
  font-weight: 600;
}

.ingredient-amount__mode {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  font-style: italic;
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
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ingredient-amount__taste-hint {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0;
}

.ingredient-amount__optional {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-sm);
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
  border-radius: var(--radius-xs);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
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
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-mint-hover);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.dish-search__create:hover {
  background: var(--color-empty);
  border-color: var(--color-mint);
}
</style>
