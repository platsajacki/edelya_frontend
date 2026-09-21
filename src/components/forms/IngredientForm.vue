<template>
  <ModalWrapper v-model="open" :title="copy.title" :z-index="zIndex">
    <form id="ingredient-form" class="form" @submit.prevent="submit">
      <div v-if="copy.notice" class="form__notice">{{ copy.notice }}</div>

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
        {{ saving ? "Сохранение…" : copy.submit }}
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
import type {
  DTOIngredient,
  DTOIngredientCategory,
  IngredientFormInitial,
  IngredientFormMode,
} from "@/types/ingredient"
import { UNITS } from "../../utils/unitLabels"

const MODE_COPY: Record<IngredientFormMode, { title: string; submit: string; notice: string }> = {
  create: {
    title: "Новый ингредиент",
    submit: "Создать",
    notice: "",
  },
  edit: {
    title: "Редактировать ингредиент",
    submit: "Сохранить",
    notice: "Изменится во всех ваших рецептах.",
  },
  copy: {
    title: "Личная копия",
    submit: "Создать копию",
    notice: "Копия станет вашей, её можно менять. Общий ингредиент останется как есть.",
  },
  "from-draft": {
    title: "Свой ингредиент",
    submit: "Создать и привязать",
    notice: "Строка рецепта будет привязана к новому ингредиенту.",
  },
}

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
    mode?: IngredientFormMode
    ingredient?: DTOIngredient | null
    initial?: IngredientFormInitial | null
  }>(),
  {
    zIndex: 1020,
    mode: "create",
    ingredient: null,
    initial: null,
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

const copy = computed(() => MODE_COPY[props.mode])

const unitChanged = computed(() => {
  if (props.mode !== "edit" || !props.ingredient || !baseUnit.value) return false
  return baseUnit.value !== props.ingredient.base_unit
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
  (v) => {
    if (!v) return
    error.value = ""
    fillFields()
    void loadCategories()
  }
)

function fillFields() {
  const source = props.ingredient
  name.value = source?.name ?? props.initial?.name ?? ""
  categoryId.value = source?.category.id ?? props.initial?.categoryId ?? ""
  baseUnit.value = source?.base_unit ?? props.initial?.baseUnit ?? ""
}

async function loadCategories() {
  try {
    const data = await fetchIngredientCategories()
    categories.value = data.results ?? []
  } catch {
    categories.value = []
  }
}

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
  if (props.mode === "edit" && props.ingredient) {
    emit("updated", await updateIngredient(props.ingredient.id, payload))
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
