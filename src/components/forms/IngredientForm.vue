<template>
  <ModalWrapper v-model="open" title="Новый ингредиент" :z-index="zIndex">
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
        <span class="form__label">Единица измерения <span class="form__required">*</span></span>
        <select v-model="baseUnit" class="form__select" required>
          <option value="" disabled>Выберите единицу</option>
          <option v-for="u in UNITS" :key="u.value" :value="u.value">
            {{ u.label }}
          </option>
        </select>
      </label>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : "Создать ингредиент" }}
      </button>
    </form>
  </ModalWrapper>
</template>

<script setup>
import { ref, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import { createIngredient, fetchIngredientCategories } from "../../services/ingredientService"

const UNITS = [
  { value: "gram", label: "Грамм" },
  { value: "kilogram", label: "Килограмм" },
  { value: "milligram", label: "Миллиграмм" },
  { value: "liter", label: "Литр" },
  { value: "milliliter", label: "Миллилитр" },
  { value: "piece", label: "Штука" },
  { value: "slice", label: "Ломтик" },
  { value: "teaspoon", label: "Чайная ложка" },
  { value: "tablespoon", label: "Столовая ложка" },
  { value: "glass", label: "Стакан" },
  { value: "cup", label: "Чашка" },
  { value: "bunch", label: "Пучок" },
  { value: "can", label: "Банка" },
  { value: "pinch", label: "Щепотка" },
  { value: "clove", label: "Зубчик" },
  { value: "to_taste", label: "По вкусу" },
]

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  zIndex: { type: Number, default: 1020 },
})

const emit = defineEmits(["update:modelValue", "created"])

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const name = ref("")
const categoryId = ref("")
const baseUnit = ref("")
const categories = ref([])
const saving = ref(false)
const error = ref("")

watch(() => props.modelValue, async (v) => {
  if (v) {
    error.value = ""
    name.value = ""
    categoryId.value = ""
    baseUnit.value = ""
    try {
      const data = await fetchIngredientCategories()
      categories.value = data.results ?? []
    } catch {
      categories.value = []
    }
  }
})

function validate() {
  if (!name.value.trim()) return "Укажите название ингредиента."
  if (!categoryId.value) return "Выберите категорию."
  if (!baseUnit.value) return "Выберите единицу измерения."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    const ingredient = await createIngredient({
      name: name.value.trim(),
      base_unit: baseUnit.value,
      category: categoryId.value,
    })
    emit("created", ingredient)
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось создать ингредиент"
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

.form__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.form__input,
.form__select {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.form__input:focus,
.form__select:focus {
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
}

.form__submit:hover:not(:disabled) {
  background: var(--color-mint-hover);
}

.form__submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
