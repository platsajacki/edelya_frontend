<template>
  <ModalWrapper v-model="open" title="Новый ингредиент" :z-index="zIndex">
    <form id="ingredient-form" class="form" @submit.prevent="submit">
      <label class="form__field">
        <span class="form__label">Название <span class="form__required">*</span></span>
        <input v-model="name" v-autofocus.select type="text" class="form__input" required />
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

      <div v-if="error" ref="errorRef" class="form__error">{{ error }}</div>
    </form>

    <template #footer>
      <button type="submit" form="ingredient-form" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : "Создать ингредиент" }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { ref, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import { createIngredient, fetchIngredientCategories } from "../../services/ingredientService"
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import type { DTOIngredient, DTOIngredientCategory } from "@/types/shopping"

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

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
    initialName?: string
  }>(),
  {
    zIndex: 1020,
    initialName: "",
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "created", ingredient: DTOIngredient): void
}>()

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
const categoryId = ref("")
const baseUnit = ref("")
const categories = ref<DTOIngredientCategory[]>([])
const saving = ref(false)
const error = ref("")
const errorRef = ref<HTMLElement | null>(null)
watch(error, (val) => {
  if (val) nextTick(() => errorRef.value?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
})

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      error.value = ""
      name.value = props.initialName || ""
      categoryId.value = ""
      baseUnit.value = ""
      try {
        const data = await fetchIngredientCategories()
        categories.value = data.results ?? []
      } catch {
        categories.value = []
      }
    }
  }
)

function validate() {
  if (!name.value.trim()) return "Укажите название ингредиента."
  if (!categoryId.value) return "Выберите категорию."
  if (!baseUnit.value) return "Выберите единицу измерения."
  return null
}

async function submit() {
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }
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
    error.value = err instanceof Error ? err.message : "Не удалось создать ингредиент"
  } finally {
    saving.value = false
  }
}
</script>
