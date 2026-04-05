<template>
  <ModalWrapper v-model="open" :title="'Добавить позицию'" :z-index="zIndex">
    <div class="add-item-form">
      <!-- Step 1: Search ingredient -->
      <div v-if="!selectedIngredient" class="ingredient-search">
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          class="form__input"
          placeholder="Поиск ингредиента..."
          @input="onSearch"
        />
        <div v-if="searching" class="add-item-form__status"><div class="spinner spinner--sm" /></div>
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
        <div v-else-if="searched && !searching" class="add-item-form__status">Ничего не найдено</div>
        <button type="button" class="add-item-form__create" @click="showIngredientForm = true">
          + Создать ингредиент
        </button>
      </div>

      <!-- Step 2: Enter amount -->
      <div v-else class="amount-step">
        <div class="amount-step__header">
          <span class="amount-step__name">{{ selectedIngredient.name }}</span>
          <button type="button" class="amount-step__change" @click="clearSelection">Изменить</button>
        </div>

        <p v-if="selectedIngredient.base_unit === 'to_taste'" class="amount-step__taste-hint">
          Количество не указывается — добавится как «по вкусу»
        </p>
        <label v-else class="form__field">
          <span class="form__label">Количество <span class="form__required">*</span></span>
          <div class="amount-step__row">
            <input
              ref="amountInput"
              v-model="amount"
              type="text"
              inputmode="decimal"
              autocomplete="off"
              class="form__input amount-step__input"
              :placeholder="'Например: 100'"
              @focus="$event.target.select()"
              @keydown.enter.prevent="submit"
            />
            <span class="amount-step__unit">{{ unitLabel(selectedIngredient.base_unit) }}</span>
          </div>
        </label>

        <div v-if="error" class="form__error">{{ error }}</div>

        <button
          type="button"
          class="form__submit"
          :disabled="saving"
          @click="submit"
        >
          {{ saving ? "Добавление..." : "Добавить" }}
        </button>
      </div>
    </div>

    <IngredientForm
      v-model="showIngredientForm"
      :z-index="zIndex + 10"
      @created="onIngredientCreated"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import IngredientForm from "./IngredientForm.vue"
import { fetchIngredients } from "../../services/ingredientService"
import { getUnitLabel } from "../../utils/unitSteps"
import { useShoppingStore } from "../../store/shopping"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  zIndex: { type: Number, default: 1010 },
  listId: { type: String, required: true },
})

const emit = defineEmits(["update:modelValue", "created"])

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const query = ref("")
const results = ref([])
const searching = ref(false)
const searched = ref(false)
const searchInput = ref(null)
const amountInput = ref(null)

const selectedIngredient = ref(null)
const amount = ref("")
const saving = ref(false)
const error = ref("")
const showIngredientForm = ref(false)

let debounceTimer = null

function unitLabel(unit) {
  return getUnitLabel(unit)
}

watch(() => props.modelValue, (v) => {
  if (v) {
    reset()
    nextTick(() => searchInput.value?.focus())
  }
})

function reset() {
  query.value = ""
  results.value = []
  searching.value = false
  searched.value = false
  selectedIngredient.value = null
  amount.value = ""
  error.value = ""
}

function onIngredientCreated(ing) {
  showIngredientForm.value = false
  selectIngredient(ing)
}

function onSearch() {
  clearTimeout(debounceTimer)
  const q = query.value.trim()
  if (!q) {
    results.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      const data = await fetchIngredients({ name__icontains: q })
      results.value = data.results ?? []
    } catch {
      results.value = []
    } finally {
      searching.value = false
      searched.value = true
    }
  }, 300)
}

function selectIngredient(ing) {
  selectedIngredient.value = ing
  nextTick(() => amountInput.value?.focus())
}

function clearSelection() {
  selectedIngredient.value = null
  amount.value = ""
  error.value = ""
  nextTick(() => searchInput.value?.focus())
}

async function submit() {
  const isToTaste = selectedIngredient.value?.base_unit === 'to_taste'

  let finalAmount = "0"
  if (!isToTaste) {
    const raw = amount.value.trim().replace(',', '.')
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
    const store = useShoppingStore()
    const data = await store.addItem(props.listId, {
      ingredient: selectedIngredient.value.id,
      amount: finalAmount,
    })
    emit("created", data)
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось добавить позицию"
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.add-item-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.add-item-form__status {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
}

.amount-step__taste-hint {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  padding: 4px 0 8px;
}

.ingredient-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.add-item-form__create {
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

.add-item-form__create:hover {
  background: var(--color-empty);
  border-color: var(--color-mint);
}

.ingredient-search__list {
  list-style: none;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}

.ingredient-search__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.ingredient-search__item:active {
  background: var(--color-empty);
}

.ingredient-search__item + .ingredient-search__item {
  border-top: 1px solid var(--color-border);
}

.ingredient-search__name {
  font-size: var(--font-md);
  color: var(--color-text);
}

.ingredient-search__unit {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.amount-step {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.amount-step__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.amount-step__name {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
}

.amount-step__change {
  background: none;
  border: none;
  color: var(--color-mint);
  font-size: var(--font-sm);
  font-weight: 500;
  cursor: pointer;
  padding: 2px 0;
}

.amount-step__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount-step__input {
  flex: 1;
}

.amount-step__unit {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.form__input {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.form__input:focus {
  border-color: var(--color-mint);
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
  width: 100%;
}

.form__submit:hover:not(:disabled) {
  background: var(--color-mint-hover);
}

.form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
