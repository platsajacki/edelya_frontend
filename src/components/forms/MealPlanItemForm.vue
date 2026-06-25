<template>
  <ModalWrapper
    v-model="open"
    :title="isEdit ? 'Редактировать приём пищи' : 'Добавить приём пищи'"
    :z-index="1000"
  >
    <form id="meal-plan-form" class="form" @submit.prevent="submit">
      <!-- Dish selection -->
      <div class="form__field">
        <span class="form__label">Блюдо <span class="form__required">*</span></span>
        <div v-if="selectedDish" class="selected-dish">
          <span class="selected-dish__name">{{ selectedDish.name }}</span>
          <template v-if="!isDishLocked">
            <button
              type="button"
              class="selected-dish__edit"
              :title="isDishOwn(selectedDish) ? 'Редактировать блюдо' : 'Создать копию'"
              @click="onEditDishClick"
            >
              <IconPencil />
            </button>
            <button type="button" class="selected-dish__clear" @click="selectedDish = null">
              &times;
            </button>
          </template>
        </div>
        <template v-else>
          <DishSearch @select="onDishSelect" @create="onCreateDish" />
        </template>
        <p v-if="isDishLocked" class="form__hint">
          Блюдо привязано к готовке и не может быть изменено
        </p>
      </div>

      <label v-if="isEdit" class="form__field">
        <span class="form__label">Дата <span class="form__required">*</span></span>
        <DateInput v-model="mealDate" required />
      </label>

      <div v-else class="form__field">
        <span class="form__label">Дни еды <span class="form__required">*</span></span>
        <MultiDayPicker v-model="eatDates" :start-date="initialDate" />
      </div>

      <div v-if="error" ref="errorRef" class="form__error">{{ error }}</div>
    </form>

    <DishForm
      v-model="showDishForm"
      :edit-dish="editDish"
      :initial-name="initialDishName"
      :z-index="1010"
      @created="onDishCreated"
      @updated="onDishUpdated"
    />

    <DishForm
      v-model="showCloneForm"
      :z-index="1020"
      :clone-dish="dishToClone"
      @created="onCloneCreated"
    />

    <template #footer>
      <button
        type="submit"
        form="meal-plan-form"
        class="form__submit"
        :disabled="saving || !selectedDish"
      >
        {{ saving ? "Сохранение..." : isEdit ? "Сохранить" : "Добавить" }}
      </button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import DishSearch from "./DishSearch.vue"
import DishForm from "./DishForm.vue"
import DateInput from "./DateInput.vue"
import MultiDayPicker from "./MultiDayPicker.vue"
import { usePlanningStore } from "../../store/planning"
import IconPencil from "../icons/IconPencil.vue"
import { isDishOwn } from "../../utils/dishOwnership"
import type { DTOMealPlanItem } from "@/types/planning"
import type { DTODish } from "@/types/dish"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    editItem?: DTOMealPlanItem | null
    initialDate?: string
  }>(),
  {
    editItem: null,
    initialDate: "",
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
}>()

const planning = usePlanningStore()

const isEdit = computed(() => !!props.editItem)
const isDishLocked = computed(() => isEdit.value && !!props.editItem?.cooking_event)

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

const selectedDish = ref<DTODish | null>(null)
const mealDate = ref("")
const eatDates = ref<string[]>([])
const saving = ref(false)
const error = ref("")
const errorRef = ref<HTMLElement | null>(null)
watch(error, (val) => {
  if (val) nextTick(() => errorRef.value?.scrollIntoView({ behavior: "smooth", block: "nearest" }))
})
const showDishForm = ref(false)
const editDish = ref<DTODish | null>(null)
const initialDishName = ref("")
const showCloneForm = ref(false)
const dishToClone = ref<DTODish | null>(null)

watch(
  () => props.modelValue,
  (v) => {
    if (v && props.editItem) {
      selectedDish.value = props.editItem.dish
      mealDate.value = props.editItem.date
      eatDates.value = []
      error.value = ""
    } else if (v) {
      selectedDish.value = null
      mealDate.value = ""
      eatDates.value = props.initialDate ? [props.initialDate] : []
      error.value = ""
    }
  }
)

function onDishSelect(dish: DTODish) {
  selectedDish.value = dish
  error.value = ""
}

function onDishCreated(dish: DTODish) {
  selectedDish.value = dish
  error.value = ""
}

function onDishUpdated(dish: DTODish) {
  selectedDish.value = dish
  error.value = ""
}

function onCreateDish(searchQuery: string) {
  editDish.value = null
  initialDishName.value = searchQuery || ""
  showDishForm.value = true
}

function onEditDishClick() {
  if (!selectedDish.value) return
  if (isDishOwn(selectedDish.value)) {
    editDish.value = selectedDish.value
    showDishForm.value = true
  } else {
    dishToClone.value = selectedDish.value
    showCloneForm.value = true
  }
}

function onCloneCreated(dish: DTODish) {
  selectedDish.value = dish
  showCloneForm.value = false
  error.value = ""
}

function validate() {
  if (!selectedDish.value) return "Выберите блюдо."
  if (isEdit.value && !mealDate.value) return "Укажите дату."
  if (!isEdit.value && !eatDates.value.length) return "Выберите хотя бы один день."
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
    if (isEdit.value) {
      await planning.editMealPlanItem(props.editItem!.id, {
        dish: selectedDish.value!.id,
        date: mealDate.value,
      })
    } else {
      await planning.addMealPlanItem({
        dish: selectedDish.value!.id,
        eat_dates: [...eatDates.value].sort(),
      })
    }
    open.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Не удалось сохранить приём пищи"
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.clone-confirm__text {
  font-size: var(--font-sm);
  color: var(--color-text);
  line-height: 1.5;
  margin: 0;
}

.clone-confirm__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form__cancel {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-base);
  font-weight: 600;
  background: var(--color-empty);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.form__hint {
  margin: 4px 0 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.form__cancel:hover {
  background: var(--color-border);
}
</style>
