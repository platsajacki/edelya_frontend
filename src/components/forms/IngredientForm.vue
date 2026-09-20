<template>
  <ModalWrapper v-model="open" :title="title" :z-index="zIndex">
    <form id="ingredient-form" class="form" @submit.prevent="submit">
      <div v-if="isClone" class="form__notice">
        Это личная копия общего ингредиента — вы можете изменить её под себя.
      </div>

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

      <div v-if="unitChanged" class="form__warning" role="status">
        <IconWarning :width="14" :height="14" />
        Единица измерения изменится во всех ваших рецептах и списках покупок.
      </div>

      <div v-if="error" ref="errorRef" class="form__error" role="alert">{{ error }}</div>
    </form>

    <template #footer>
      <button type="submit" form="ingredient-form" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение…" : isEdit ? "Сохранить" : "Создать ингредиент" }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import {
  createIngredient,
  updateIngredient,
  fetchIngredientCategories,
} from "../../services/ingredientService"
import IconWarning from "../icons/IconWarning.vue"
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import { getScrollBehavior } from "@/dom/prefersReducedMotion"
import type { DTOIngredient, DTOIngredientCategory } from "@/types/ingredient"
import { UNITS } from "../../utils/unitLabels"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
    initialName?: string
    cloneIngredient?: DTOIngredient | null
    editIngredient?: DTOIngredient | null
  }>(),
  {
    zIndex: 1020,
    initialName: "",
    cloneIngredient: null,
    editIngredient: null,
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "created", ingredient: DTOIngredient): void
  (e: "updated", ingredient: DTOIngredient): void
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

const isClone = computed(() => !!props.cloneIngredient)
const isEdit = computed(() => !!props.editIngredient)
const source = computed(() => props.editIngredient ?? props.cloneIngredient)

const title = computed(() => {
  if (isEdit.value) return "Редактировать ингредиент"
  return isClone.value ? "Создать личную копию" : "Новый ингредиент"
})

const unitChanged = computed(() => {
  if (!props.editIngredient || !baseUnit.value) return false
  return baseUnit.value !== props.editIngredient.base_unit
})

const name = ref("")
const categoryId = ref("")
const baseUnit = ref("")
const categories = ref<DTOIngredientCategory[]>([])
const saving = ref(false)
const error = ref("")
const errorRef = ref<HTMLElement | null>(null)
watch(error, (val) => {
  if (val)
    nextTick(() =>
      errorRef.value?.scrollIntoView({ behavior: getScrollBehavior(), block: "nearest" })
    )
})

watch(
  () => props.modelValue,
  async (v) => {
    if (v) {
      error.value = ""
      name.value = source.value?.name || props.initialName || ""
      categoryId.value = source.value?.category.id || ""
      baseUnit.value = source.value?.base_unit || ""
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

async function save() {
  const payload = {
    name: name.value.trim(),
    base_unit: baseUnit.value,
    category: categoryId.value,
  }
  if (props.editIngredient) {
    emit("updated", await updateIngredient(props.editIngredient.id, payload))
    return
  }
  emit("created", await createIngredient(payload))
}

async function submit() {
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }
  saving.value = true
  try {
    await save()
    open.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Не удалось сохранить ингредиент"
  } finally {
    saving.value = false
  }
}
</script>
