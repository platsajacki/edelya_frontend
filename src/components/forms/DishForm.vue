<template>
  <ModalWrapper
    v-model="open"
    :title="isEdit ? 'Редактировать блюдо' : isClone ? 'Создать личную копию' : 'Новое блюдо'"
    :z-index="zIndex"
  >
    <form id="dish-form" class="form" @submit.prevent="submit">
      <!-- Clone notice -->
      <div v-if="isClone" class="dish-form__clone-notice">
        Это личная копия общего блюда — вы можете изменить её под себя.
      </div>

      <label class="form__field">
        <span class="form__label">Название <span class="form__required">*</span></span>
        <input
          v-model="name"
          v-autofocus.select="!isEdit"
          type="text"
          class="form__input"
          required
        />
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
        <textarea
          ref="recipeRef"
          v-model="recipe"
          class="form__textarea form__textarea--auto"
          rows="2"
          @input="autoResize($event.target as HTMLTextAreaElement)"
        />
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
                ref="amountInputRef"
                v-model="pendingAmount"
                v-autofocus.select
                type="text"
                inputmode="decimal"
                autocomplete="off"
                class="form__input ingredient-amount__input"
                placeholder="Например: 200"
                @keydown.enter.prevent="confirmIngredient"
              />
              <span class="ingredient-amount__unit">{{
                UNIT_LABELS[pendingIngredient.base_unit] || pendingIngredient.base_unit
              }}</span>
            </div>
            <p v-else class="ingredient-amount__taste-hint">
              Количество не указывается — добавится как «по вкусу»
            </p>
            <label class="ingredient-amount__optional">
              <input v-model="pendingOptional" type="checkbox" />
              Опционально
            </label>
            <div v-if="amountError" class="form__error">{{ amountError }}</div>
            <div class="ingredient-amount__actions">
              <button type="button" class="btn btn--sm" @click="confirmIngredient">
                Сохранить
              </button>
              <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredient">
                Отмена
              </button>
            </div>
          </div>
          <!-- Normal row -->
          <div
            v-else
            class="ingredient-row"
            :class="{ 'ingredient-row--optional': ing.is_optional }"
          >
            <span class="ingredient-row__name">{{ ing.ingredientName }}</span>
            <span v-if="ing.is_optional" class="ingredient-row__opt-label">опц.</span>
            <span class="ingredient-row__amount">{{
              formatShoppingAmount(ing.amount, ing.base_unit).display
            }}</span>
            <button
              type="button"
              class="ingredient-row__edit"
              title="Редактировать"
              @click="startEditIngredient(idx)"
            >
              <IconPencil :width="16" :height="16" />
            </button>
            <button
              type="button"
              class="ingredient-row__remove"
              title="Удалить"
              @click="removeIngredient(idx)"
            >
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
              ref="amountInputRef"
              v-model="pendingAmount"
              v-autofocus.select
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="form__input ingredient-amount__input"
              placeholder="Например: 200"
              @keydown.enter.prevent="confirmIngredient"
            />
            <span class="ingredient-amount__unit">{{
              UNIT_LABELS[pendingIngredient.base_unit] || pendingIngredient.base_unit
            }}</span>
          </div>
          <p v-else class="ingredient-amount__taste-hint">
            Количество не указывается — добавится как «по вкусу»
          </p>
          <label class="ingredient-amount__optional">
            <input v-model="pendingOptional" type="checkbox" />
            Опционально
          </label>
          <div v-if="amountError" class="form__error">{{ amountError }}</div>
          <div class="ingredient-amount__actions">
            <button type="button" class="btn btn--sm" @click="confirmIngredient">Добавить</button>
            <button type="button" class="btn btn--sm btn--ghost" @click="cancelIngredient">
              Отмена
            </button>
          </div>
        </div>

        <!-- Ingredient search (always visible when no pending ingredient) -->
        <div v-else class="ingredient-search">
          <div class="search-field">
            <input
              v-model="ingredientQuery"
              type="search"
              class="form__input"
              placeholder="Поиск ингредиента..."
              @input="searchIngredients"
            />
            <button
              v-if="ingredientQuery"
              type="button"
              class="search-field__clear"
              aria-label="Очистить"
              @click="clearIngredientQuery"
            >
              &times;
            </button>
          </div>
          <ul v-if="ingredientResults.length" class="ingredient-search__list">
            <li
              v-for="ing in ingredientResults"
              :key="ing.id"
              class="ingredient-search__item"
              @click="selectIngredient(ing)"
            >
              {{ ing.name }}
              <span class="ingredient-search__unit">{{
                UNIT_LABELS[ing.base_unit] || ing.base_unit
              }}</span>
            </li>
          </ul>
          <button type="button" class="dish-search__create" @click="openIngredientForm">
            + Создать ингредиент
          </button>
        </div>
      </div>

      <div v-if="error" ref="errorRef" class="form__error">{{ error }}</div>

      <div v-if="duplicateActions" class="form__duplicate-actions">
        <button
          type="button"
          class="form__duplicate-use"
          :disabled="loadingExisting"
          @click="useExistingDish"
        >
          {{ loadingExisting ? "Поиск..." : "Использовать существующее" }}
        </button>
        <span class="form__duplicate-hint">или переименуйте выше</span>
      </div>
    </form>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      :initial-name="ingredientFormInitialName"
      @created="onIngredientCreated"
    />

    <template #footer>
      <button type="submit" form="dish-form" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать блюдо" }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import { ref, computed, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import IconPencil from "../icons/IconPencil.vue"
import IconClose from "../icons/IconClose.vue"
import { createDish, updateDish, fetchDishCategories, fetchDishes } from "@/services/dishService.ts"
import { isDishOwn } from "@/utils/dishOwnership.ts"
import { fetchIngredients } from "@/services/ingredientService.ts"
import { formatAmount } from "@/utils/formatAmount.ts"
import { formatShoppingAmount } from "@/utils/formatShoppingAmount.ts"
import { UNIT_LABELS } from "@/utils/unitLabels.ts"
import type { DTOBaseUnit, DTODish, DTODishCategory } from "@/types/dish"
import type { DTOIngredient } from "@/types/shopping"

interface PendingIngredient {
  id: string
  name: string
  base_unit: DTOBaseUnit
}

interface IngredientRow {
  ingredient: string
  ingredientName: string
  amount: string
  base_unit: DTOBaseUnit
  unitLabel: string
  is_optional: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
    editDish?: DTODish | null
    cloneDish?: DTODish | null
    initialName?: string
  }>(),
  { zIndex: 1010, editDish: null, cloneDish: null, initialName: "" }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "created", dish: DTODish): void
  (e: "updated", dish: DTODish): void
}>()

const isEdit = computed(() => !!props.editDish)
const isClone = computed(() => !props.editDish && !!props.cloneDish)

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

const name = ref("")
const categoryId = ref<string | number>("")
const recipe = ref("")
const categories = ref<DTODishCategory[]>([])
const ingredients = ref<IngredientRow[]>([])
const saving = ref(false)
const error = ref("")
const duplicateActions = ref(false)
const loadingExisting = ref(false)
watch(error, (val) => {
  if (val) nextTick(() => errorRef.value?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
})

const ingredientQuery = ref("")
const ingredientResults = ref<DTOIngredient[]>([])
const showIngredientForm = ref(false)
const ingredientFormInitialName = ref("")

const pendingIngredient = ref<PendingIngredient | null>(null)
const pendingAmount = ref("")
const pendingOptional = ref(false)
const amountError = ref("")
const editingIdx = ref<number | null>(null)
const amountInputRef = ref<HTMLInputElement | HTMLInputElement[] | null>(null)
const recipeRef = ref<HTMLTextAreaElement | null>(null)
const errorRef = ref<HTMLElement | null>(null)

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = "auto"
  el.style.height = el.scrollHeight + "px"
}

function focusAmountInput() {
  const el = Array.isArray(amountInputRef.value) ? amountInputRef.value[0] : amountInputRef.value
  el?.focus()
}

let ingredientSearchTimer: ReturnType<typeof setTimeout> | null = null

function mapDishIngredients(dish: DTODish): IngredientRow[] {
  return (dish.dish_ingredients || []).map((di) => ({
    ingredient: di.ingredient?.id ?? "",
    ingredientName: di.ingredient?.name ?? "",
    amount: formatAmount(di.amount),
    base_unit: di.ingredient?.base_unit ?? ("" as DTOBaseUnit),
    unitLabel: UNIT_LABELS[di.ingredient?.base_unit] || di.ingredient?.base_unit || "",
    is_optional: di.is_optional ?? false,
  }))
}

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      error.value = ""
      duplicateActions.value = false
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
        ingredients.value = mapDishIngredients(props.editDish)
      } else if (props.cloneDish) {
        name.value = props.cloneDish.name || ""
        categoryId.value = props.cloneDish.category?.id || ""
        recipe.value = props.cloneDish.recipe || ""
        ingredients.value = mapDishIngredients(props.cloneDish)
      } else {
        name.value = props.initialName || ""
        categoryId.value = ""
        recipe.value = ""
        ingredients.value = []
      }
      await nextTick()
      if (recipeRef.value) autoResize(recipeRef.value)
    }
  }
)

function openIngredientForm() {
  ingredientFormInitialName.value = ingredientQuery.value.trim()
  showIngredientForm.value = true
}

function clearIngredientQuery() {
  ingredientQuery.value = ""
  ingredientResults.value = []
}

function resetIngredientSearch() {
  ingredientQuery.value = ""
  ingredientResults.value = []
  pendingIngredient.value = null
  pendingAmount.value = ""
  pendingOptional.value = false
  editingIdx.value = null
}

function searchIngredients() {
  clearTimeout(ingredientSearchTimer ?? undefined)
  const q = ingredientQuery.value.trim()
  if (!q) {
    ingredientResults.value = []
    return
  }
  ingredientSearchTimer = setTimeout(async () => {
    try {
      const data = await fetchIngredients({ search: q })
      ingredientResults.value = data.results ?? []
    } catch {
      ingredientResults.value = []
    }
  }, 300)
}

function selectIngredient(ing: DTOIngredient) {
  const alreadyAdded = ingredients.value.some((i) => i.ingredient === ing.id)
  if (alreadyAdded) {
    error.value = "Ингредиент уже добавлен."
    return
  }
  pendingIngredient.value = ing
  ingredientQuery.value = ""
  ingredientResults.value = []
  amountError.value = ""
  editingIdx.value = null
  nextTick(() => focusAmountInput())
}

function startEditIngredient(idx: number) {
  const ing = ingredients.value[idx]
  pendingIngredient.value = {
    id: ing.ingredient,
    name: ing.ingredientName,
    base_unit: ing.base_unit,
  }
  pendingAmount.value = ing.base_unit === "to_taste" ? "" : formatAmount(ing.amount)
  pendingOptional.value = ing.is_optional
  editingIdx.value = idx
  amountError.value = ""
  ingredientQuery.value = ""
  ingredientResults.value = []
  nextTick(() => focusAmountInput())
}

function removeIngredient(idx: number) {
  ingredients.value.splice(idx, 1)
  if (editingIdx.value === idx) {
    resetIngredientSearch()
  } else if (editingIdx.value !== null && editingIdx.value > idx) {
    editingIdx.value--
  }
}

function confirmIngredient() {
  if (!pendingIngredient.value) return
  const isToTaste = pendingIngredient.value.base_unit === "to_taste"
  let finalAmount = "1"
  if (!isToTaste) {
    const raw = pendingAmount.value.trim().replace(",", ".")
    const num = Number(raw)
    if (!raw || isNaN(num) || num <= 0) {
      amountError.value = "Введите количество больше 0."
      return
    }
    finalAmount = String(num)
  }
  amountError.value = ""
  const row: IngredientRow = {
    ingredient: pendingIngredient.value.id,
    ingredientName: pendingIngredient.value.name,
    amount: finalAmount,
    base_unit: pendingIngredient.value.base_unit,
    unitLabel:
      UNIT_LABELS[pendingIngredient.value.base_unit] || pendingIngredient.value.base_unit || "",
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

function onIngredientCreated(ingredient: DTOIngredient) {
  selectIngredient(ingredient)
}

function validate(): string | null {
  if (!name.value.trim()) return "Укажите название рецепта."
  if (!categoryId.value) return "Выберите категорию."
  if (!ingredients.value.length) return "Добавьте хотя бы один ингредиент."
  const ids = ingredients.value.map((i) => i.ingredient)
  if (new Set(ids).size !== ids.length) return "Ингредиенты не должны повторяться."
  return null
}

async function submit() {
  error.value = validate() ?? ""
  if (error.value) return
  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      name: name.value.trim(),
      category: categoryId.value,
    }
    if (recipe.value.trim()) payload.recipe = recipe.value.trim()
    if (ingredients.value.length) {
      payload.dish_ingredients = ingredients.value.map((i) => ({
        ingredient: i.ingredient,
        amount: i.amount,
        is_optional: i.is_optional,
      }))
    }
    if (isEdit.value) {
      const dish = await updateDish(props.editDish!.id, payload as Partial<DTODish>)
      emit("updated", dish)
    } else {
      const dish = await createDish(payload as Partial<DTODish>)
      emit("created", dish)
    }
    open.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    error.value = message || "Не удалось создать блюдо"
    if (isClone.value && message.includes("уже существует")) {
      duplicateActions.value = true
    }
  } finally {
    saving.value = false
  }
}

async function useExistingDish() {
  loadingExisting.value = true
  try {
    const data = await fetchDishes({ name__icontains: name.value.trim(), only_owned: true })
    const found = (data.results ?? []).find(
      (d) => isDishOwn(d) && d.name.toLowerCase() === name.value.trim().toLowerCase()
    )
    if (!found) {
      error.value = "Не удалось найти блюдо. Переименуйте и попробуйте снова."
      duplicateActions.value = false
      return
    }
    emit("created", found)
    open.value = false
  } catch {
    error.value = "Ошибка при поиске блюда."
  } finally {
    loadingExisting.value = false
  }
}
</script>

<style lang="scss" scoped>
.dish-form {
  &__clone-notice {
    padding: 10px 12px;
    background: var(--color-mint-alpha-08);
    border: 1px solid var(--color-mint-alpha-25);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.45;
  }
}

.form {
  &__duplicate-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--color-mint-alpha-10);
    border: 1.5px solid var(--color-mint-alpha-25);
    border-radius: var(--radius-sm);
  }

  &__duplicate-use {
    flex-shrink: 0;
    padding: 7px 14px;
    border: 1.5px solid var(--color-mint);
    border-radius: var(--radius-sm);
    background: var(--color-mint);
    color: var(--on-primary);
    font-size: var(--font-sm);
    font-weight: 600;
    cursor: pointer;
    transition:
      background var(--transition-fast),
      opacity var(--transition-fast);

    &:hover {
      background: var(--color-mint-hover);
    }
    &:disabled {
      opacity: 0.6;
      cursor: default;
    }
  }

  &__duplicate-hint {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--color-border);
    padding-top: 16px;
  }
}

.ingredient-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-sm);

  &:last-of-type {
    border-bottom: none;
  }
  &--optional {
    opacity: 0.75;
  }

  &__name {
    flex: 1;
    font-weight: 500;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__amount {
    flex-shrink: 0;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  &__opt-label {
    font-size: var(--font-xs);
    color: var(--color-mint);
    background: var(--color-mint-alpha-12);
    border-radius: var(--radius-xs);
    padding: 1px 5px;
    font-weight: 500;
    white-space: nowrap;
  }

  &__edit,
  &__remove {
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
    transition:
      opacity var(--transition-fast),
      color var(--transition-fast),
      background var(--transition-fast);
    padding: 0;
  }

  &__edit {
    &:hover {
      opacity: 1;
      color: var(--color-mint);
      background: var(--color-mint-alpha-10);
    }
  }

  &:hover &__edit {
    opacity: 1;
    color: var(--color-mint);
    background: var(--color-mint-alpha-10);
  }

  &__remove {
    &:hover {
      opacity: 1;
      color: var(--color-danger);
      background: var(--color-danger-pale);
    }
  }
}

.ingredient-amount {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--color-empty);
  border-radius: var(--radius-xs);
  border: 1.5px solid var(--color-border);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__name {
    font-size: var(--font-sm);
    font-weight: 600;
  }

  &__mode {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__unit {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  &__taste-hint {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    font-style: italic;
    margin: 0;
  }

  &__optional {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-xs);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);

  &--sm {
    background: var(--color-mint);
    color: var(--on-primary);

    &:hover {
      background: var(--color-mint-hover);
    }
  }

  &--ghost {
    background: transparent;
    color: var(--color-text-secondary);

    &:hover {
      background: var(--color-empty);
    }
  }
}

.dish-search {
  &__create {
    align-self: flex-start;
    padding: var(--btn-padding-sm);
    border: 1.5px dashed var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:hover {
      background: var(--color-empty);
      border-color: var(--color-mint);
      color: var(--color-mint);
    }
  }
}
</style>
