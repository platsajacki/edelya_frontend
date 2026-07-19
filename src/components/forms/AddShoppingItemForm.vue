<template>
  <ModalWrapper v-model="open" :title="'Добавить позицию'" :z-index="zIndex">
    <div class="add-item-form">
      <!-- Step 1: Search ingredient -->
      <div v-if="!selectedIngredient" class="ingredient-search">
        <div class="search-field">
          <IconSearch class="search-field__icon" />
          <input
            ref="searchInput"
            v-model="query"
            v-autofocus
            type="search"
            class="search-field__input"
            placeholder="Поиск ингредиента..."
            @input="onSearch"
          />
          <button
            v-if="query"
            type="button"
            class="search-field__clear"
            aria-label="Очистить"
            @click="clearQuery"
          >
            &times;
          </button>
        </div>
        <div v-if="searching" class="add-item-form__status">
          <div class="spinner spinner--sm" />
        </div>
        <ul v-if="results.length" class="ingredient-search__list">
          <li
            v-for="ing in results"
            :key="ing.id"
            class="ingredient-search__item"
            @click="selectIngredient(ing)"
          >
            <span class="ingredient-search__name">{{ ing.name }}</span>
            <span class="ingredient-search__unit">{{ unitLabel(ing.base_unit) }}</span>
          </li>
        </ul>
        <div v-else-if="searched && !searching" class="add-item-form__status">
          Ничего не найдено
        </div>
        <button type="button" class="add-item-form__create" @click="openIngredientForm">
          + Создать ингредиент
        </button>
      </div>

      <!-- Step 2: Enter amount -->
      <div v-else class="amount-step">
        <div class="amount-step__header">
          <span class="amount-step__name">{{ selectedIngredient.name }}</span>
          <button type="button" class="amount-step__change" @click="clearSelection">
            Изменить
          </button>
        </div>

        <template v-if="!confirmDuplicate">
          <p v-if="selectedIngredient.base_unit === 'to_taste'" class="amount-step__taste-hint">
            Количество не указывается — добавится как «по вкусу»
          </p>
          <label v-else class="form__field">
            <span class="form__label">Количество <span class="form__required">*</span></span>
            <div class="amount-step__row">
              <input
                ref="amountInput"
                v-model="amount"
                v-autofocus
                type="text"
                inputmode="decimal"
                autocomplete="off"
                class="form__input amount-step__input"
                :placeholder="'Например: 100'"
                @keydown.enter.prevent="submit"
              />
              <span class="amount-step__unit">{{ unitLabel(selectedIngredient.base_unit) }}</span>
            </div>
          </label>

          <div v-if="error" ref="errorRef" class="form__error">{{ error }}</div>

          <button type="button" class="form__submit" :disabled="saving" @click="submit">
            {{ saving ? "Добавление..." : "Добавить" }}
          </button>
        </template>

        <!-- Duplicate confirmation -->
        <div v-else class="amount-step__confirm">
          <p class="amount-step__confirm-text">
            В списке уже есть
            <strong>{{ selectedIngredient.name }}</strong>
            <template v-if="existingItem && selectedIngredient.base_unit !== 'to_taste'">
              ({{ existingItem.amount }} {{ unitLabel(selectedIngredient.base_unit) }}) </template
            >.
            <template v-if="selectedIngredient.base_unit !== 'to_taste'">
              Добавить ещё {{ amount }} {{ unitLabel(selectedIngredient.base_unit) }}?
            </template>
          </p>
          <div class="amount-step__confirm-actions">
            <button
              type="button"
              class="amount-step__confirm-cancel"
              @click="confirmDuplicate = false"
            >
              Нет
            </button>
            <button type="button" class="form__submit" :disabled="saving" @click="confirmAdd">
              {{ saving ? "Добавление..." : "Да, добавить" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      :initial-name="ingredientFormInitialName"
      @created="onIngredientCreated"
    />
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import { ref, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import IconSearch from "../icons/IconSearch.vue"
import { fetchIngredients } from "@/services/ingredientService.ts"
import { getUnitLabel } from "@/utils/unitSteps.ts"
import { useShoppingStore } from "@/store/shopping.ts"
import type { DTOIngredient, DTOShoppingListItem } from "@/types/shopping"
import type { DTOBaseUnit } from "@/types/dish"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    listId: string
    zIndex?: number
  }>(),
  { zIndex: 1010 }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "created", item: DTOShoppingListItem): void
}>()

const store = useShoppingStore()

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

const query = ref("")
const results = ref<DTOIngredient[]>([])
const searching = ref(false)
const searched = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const amountInput = ref<HTMLInputElement | null>(null)

const selectedIngredient = ref<DTOIngredient | null>(null)
const amount = ref("")
const saving = ref(false)
const error = ref("")
const errorRef = ref<HTMLElement | null>(null)
watch(error, (val) => {
  if (val) nextTick(() => errorRef.value?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
})
const showIngredientForm = ref(false)
const ingredientFormInitialName = ref("")
const confirmDuplicate = ref(false)
const existingItem = ref<DTOShoppingListItem | null>(null)

const DUPLICATE_MESSAGES = new Set([
  "Такая запись уже существует.",
  "Этот ингредиент уже в списке покупок.",
])

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function unitLabel(unit: DTOBaseUnit) {
  return getUnitLabel(unit)
}

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      reset()
    }
  }
)

function reset() {
  query.value = ""
  results.value = []
  searching.value = false
  searched.value = false
  selectedIngredient.value = null
  amount.value = ""
  error.value = ""
  confirmDuplicate.value = false
  existingItem.value = null
}

function clearQuery() {
  query.value = ""
  results.value = []
  searched.value = false
  searchInput.value?.focus()
}

function openIngredientForm() {
  ingredientFormInitialName.value = query.value.trim()
  showIngredientForm.value = true
}

function onIngredientCreated(ing: DTOIngredient) {
  showIngredientForm.value = false
  selectIngredient(ing)
}

function onSearch() {
  clearTimeout(debounceTimer ?? undefined)
  const q = query.value.trim()
  if (!q) {
    results.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      const data = await fetchIngredients({ search: q })
      results.value = data.results ?? []
    } catch {
      results.value = []
    } finally {
      searching.value = false
      searched.value = true
    }
  }, 300)
}

function selectIngredient(ing: DTOIngredient) {
  selectedIngredient.value = ing
  nextTick(() => amountInput.value?.focus())
}

function clearSelection() {
  selectedIngredient.value = null
  amount.value = ""
  error.value = ""
  confirmDuplicate.value = false
  existingItem.value = null
  nextTick(() => searchInput.value?.focus())
}

async function submit() {
  const isToTaste = selectedIngredient.value?.base_unit === "to_taste"

  let finalAmount = "0"
  if (!isToTaste) {
    const raw = amount.value.trim().replace(",", ".")
    const num = Number(raw)
    if (!raw || isNaN(num) || num <= 0) {
      error.value = "Введите количество больше 0."
      return
    }
    finalAmount = String(num)
  }

  error.value = ""
  saving.value = true
  try {
    const data = await store.addItem(props.listId, {
      ingredient: selectedIngredient.value!.id as unknown as DTOIngredient,
      amount: finalAmount,
    })
    emit("created", data)
    open.value = false
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (DUPLICATE_MESSAGES.has(message) && selectedIngredient.value?.base_unit !== "to_taste") {
      existingItem.value =
        store.items.find((i) => i.ingredient?.id === selectedIngredient.value?.id) ?? null
      confirmDuplicate.value = true
    } else {
      error.value = message || "Не удалось добавить позицию"
    }
  } finally {
    saving.value = false
  }
}

async function confirmAdd() {
  const item = existingItem.value
  if (!item) return

  const raw = amount.value.trim().replace(",", ".")
  const newAmount = String(Number(item.amount) + Number(raw))

  saving.value = true
  try {
    const data = await store.updateItemAmount(props.listId, item.id, newAmount)
    emit("created", data)
    open.value = false
  } catch (err) {
    confirmDuplicate.value = false
    error.value = (err instanceof Error ? err.message : "") || "Не удалось обновить позицию"
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
@use "../../styles/mixins" as mixins;

.add-item-form {
  display: flex;
  flex-direction: column;
  gap: 12px;

  &__status {
    display: flex;
    justify-content: center;
    padding: 12px 0;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
  }

  &__create {
    align-self: flex-start;
    padding: var(--btn-padding-sm);
    border: 1.5px dashed var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-mint-hover);
    transition:
      background var(--transition-fast),
      border-color var(--transition-fast);

    &:hover {
      background: var(--color-empty);
      border-color: var(--color-mint);
    }
  }
}

.amount-step {
  display: flex;
  flex-direction: column;
  gap: 14px;

  &__taste-hint {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    padding: 4px 0 8px;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &__name {
    font-size: var(--font-md);
    font-weight: 600;
    color: var(--color-text);
  }

  &__change {
    background: none;
    border: none;
    color: var(--color-mint);
    font-size: var(--font-sm);
    font-weight: 500;
    cursor: pointer;
    padding: 2px 0;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__input {
    flex: 1;
  }

  &__unit {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    font-weight: 500;
    white-space: nowrap;
  }

  &__confirm {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__confirm-text {
    font-size: var(--font-sm);
    color: var(--color-text);
    line-height: 1.5;
    margin: 0;
  }

  &__confirm-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  &__confirm-cancel {
    padding: 12px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--color-text);
    font-size: var(--font-base);
    font-weight: 600;
    width: 100%;
    transition: background var(--transition-fast);

    &:hover {
      background: var(--color-empty);
    }
  }
}

.form {
  &__field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__label {
    font-size: var(--font-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  &__input {
    @include mixins.form-control-base;
  }

  &__error {
    font-size: var(--font-sm);
    color: var(--color-danger);
    padding: 4px 0;
  }

  &__submit {
    padding: 12px;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--color-mint);
    color: var(--on-primary);
    font-size: var(--font-base);
    font-weight: 600;
    transition: background var(--transition-fast);
    width: 100%;

    &:hover:not(:disabled) {
      background: var(--color-mint-hover);
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
}
</style>
