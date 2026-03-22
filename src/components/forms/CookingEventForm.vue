<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать готовку' : 'Новая готовка'" :z-index="1000">
    <form class="form" @submit.prevent="submit">
      <!-- Dish selection -->
      <div class="form__field">
        <span class="form__label">Блюдо <span class="form__required">*</span></span>
        <div v-if="selectedDish" class="selected-dish">
          <span class="selected-dish__name">{{ selectedDish.name }}</span>
          <button type="button" class="selected-dish__edit" title="Редактировать блюдо" @click="editDish = selectedDish; showDishForm = true">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M11.5 2.5a1.414 1.414 0 012 2L5.5 12.5l-3 1 1-3 8-8z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <button type="button" class="selected-dish__clear" @click="selectedDish = null">&times;</button>
        </div>
        <DishSearch v-else @select="onDishSelect" @create="editDish = null; showDishForm = true" />
      </div>

      <label class="form__field">
        <span class="form__label">Дата готовки <span class="form__required">*</span></span>
        <DateInput v-model="cookingDate" required />
      </label>

      <div class="form__field">
        <span class="form__label">Дни еды <span class="form__required">*</span></span>
        <MultiDayPicker v-model="eatDates" :start-date="cookingDate" />
      </div>

      <label class="form__field">
        <span class="form__label">Комментарий</span>
        <textarea v-model="notes" class="form__textarea" rows="2" />
      </label>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving || !selectedDish">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать готовку") }}
      </button>
    </form>

    <DishForm
      v-model="showDishForm"
      :z-index="1010"
      :edit-dish="editDish"
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
const cookingDate = ref("")
const eatDates = ref([])
const notes = ref("")
const saving = ref(false)
const error = ref("")
const showDishForm = ref(false)
const editDish = ref(null)

watch(() => props.modelValue, (v) => {
  if (v && props.editItem) {
    selectedDish.value = props.editItem.dish
    cookingDate.value = props.editItem.cooking_date
    eatDates.value = (props.editItem.meal_plan_items || []).map((m) => m.date)
    notes.value = props.editItem.notes || ""
    error.value = ""
  } else if (v) {
    selectedDish.value = null
    cookingDate.value = props.initialDate || ""
    eatDates.value = []
    notes.value = ""
    error.value = ""
  }
})

watch(cookingDate, (newVal, oldVal) => {
  if (!oldVal || !newVal) return
  if (!eatDates.value.length) return
  const oldMs = new Date(oldVal + "T00:00:00").getTime()
  const newMs = new Date(newVal + "T00:00:00").getTime()
  const deltaMs = newMs - oldMs
  if (!deltaMs) return
  eatDates.value = eatDates.value
    .map((iso) => {
      const d = new Date(new Date(iso + "T00:00:00").getTime() + deltaMs)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    })
    .filter((iso) => iso >= newVal)
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
  if (!cookingDate.value) return "Укажите дату готовки."
  if (!eatDates.value.length) return "Выберите хотя бы один день еды."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    const payload = {
      dish: selectedDish.value.id,
      cooking_date: cookingDate.value,
      eat_dates: [...eatDates.value].sort(),
      notes: notes.value.trim() || undefined,
    }
    if (isEdit.value) {
      await planning.editCookingEvent(props.editItem.id, payload)
    } else {
      await planning.addCookingEvent(payload)
    }
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось сохранить готовку"
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
.form__textarea {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 16px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}

.form__input:focus,
.form__textarea:focus {
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
  transition: color 0.15s;
}

.selected-dish__edit:hover {
  color: var(--color-mint);
}

.selected-dish__clear:hover {
  background: var(--color-border);
  color: var(--color-danger);
}
</style>
