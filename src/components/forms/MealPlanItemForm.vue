<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать приём пищи' : 'Добавить приём пищи'" :z-index="1000">
    <form class="form" @submit.prevent="submit">
      <!-- Dish selection -->
      <div class="form__field">
        <span class="form__label">Блюдо <span class="form__required">*</span></span>
        <div v-if="selectedDish" class="selected-dish">
          <span class="selected-dish__name">{{ selectedDish.name }}</span>
          <button type="button" class="selected-dish__edit" @click="editDish = selectedDish; showDishForm = true" title="Редактировать блюдо">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="selected-dish__clear" @click="selectedDish = null">&times;</button>
        </div>
        <DishSearch v-else @select="onDishSelect" @create="editDish = null; showDishForm = true" />
      </div>

      <label v-if="isEdit" class="form__field">
        <span class="form__label">Дата <span class="form__required">*</span></span>
        <DateInput v-model="mealDate" required />
      </label>

      <div v-else class="form__field">
        <span class="form__label">Дни еды <span class="form__required">*</span></span>
        <MultiDayPicker v-model="eatDates" :start-date="initialDate" />
      </div>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving || !selectedDish">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Добавить") }}
      </button>
    </form>

    <DishForm
      v-model="showDishForm"
      :edit-dish="editDish"
      :z-index="1010"
      @created="onDishCreated"
      @updated="onDishUpdated"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import DishSearch from "./DishSearch.vue"
import DishForm from "./DishForm.vue"
import DateInput from "./DateInput.vue"
import MultiDayPicker from "./MultiDayPicker.vue"
import { usePlanningStore } from "../../store/planning"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  editItem: { type: Object, default: null },
  initialDate: { type: String, default: "" },
})

const emit = defineEmits(["update:modelValue"])

const planning = usePlanningStore()

const isEdit = computed(() => !!props.editItem)

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const selectedDish = ref(null)
const mealDate = ref("")
const eatDates = ref([])
const saving = ref(false)
const error = ref("")
const showDishForm = ref(false)
const editDish = ref(null)

watch(() => props.modelValue, (v) => {
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
})

function onDishSelect(dish) {
  selectedDish.value = dish
  error.value = ""
}

function onDishCreated(dish) {
  selectedDish.value = dish
  error.value = ""
}

function onDishUpdated(dish) {
  selectedDish.value = dish
  error.value = ""
}

function validate() {
  if (!selectedDish.value) return "Выберите блюдо."
  if (isEdit.value && !mealDate.value) return "Укажите дату."
  if (!isEdit.value && !eatDates.value.length) return "Выберите хотя бы один день."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    if (isEdit.value) {
      await planning.editMealPlanItem(props.editItem.id, {
        dish: selectedDish.value.id,
        date: mealDate.value,
      })
    } else {
      await planning.addMealPlanItem({
        dish: selectedDish.value.id,
        eat_dates: [...eatDates.value].sort(),
      })
    }
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось сохранить приём пищи"
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

.form__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.form__input {
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

.form__input:focus {
  border-color: var(--color-mint);
  outline: none;
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

.selected-dish {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--color-empty);
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-mint);
}

.selected-dish__name {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
}

.selected-dish__edit {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s;
}

.selected-dish__edit:hover {
  color: var(--color-mint);
}

.selected-dish__clear {
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
}

.selected-dish__clear:hover {
  background: var(--color-border);
  color: var(--color-danger);
}
</style>
