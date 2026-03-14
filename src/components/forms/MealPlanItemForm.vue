<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать приём пищи' : 'Добавить приём пищи'" :z-index="1000">
    <form class="form" @submit.prevent="submit">
      <!-- Dish selection -->
      <div class="form__field">
        <span class="form__label">Блюдо</span>
        <div v-if="selectedDish" class="selected-dish">
          <span class="selected-dish__name">{{ selectedDish.name }}</span>
          <button type="button" class="selected-dish__clear" @click="selectedDish = null">&times;</button>
        </div>
        <DishSearch v-else @select="onDishSelect" @create="showDishForm = true" />
      </div>

      <label class="form__field">
        <span class="form__label">Дата</span>
        <DateInput v-model="mealDate" required />
      </label>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving || !selectedDish">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Добавить") }}
      </button>
    </form>

    <DishForm
      v-model="showDishForm"
      :z-index="1010"
      @created="onDishCreated"
    />
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import DishSearch from "./DishSearch.vue"
import DishForm from "./DishForm.vue"
import DateInput from "./DateInput.vue"
import { usePlanningStore } from "../../store/planning"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  date: { type: String, default: "" },
  editItem: { type: Object, default: null },
})

const emit = defineEmits(["update:modelValue"])

const planning = usePlanningStore()

const isEdit = computed(() => !!props.editItem)

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const selectedDish = ref(null)
const mealDate = ref("")
const saving = ref(false)
const error = ref("")
const showDishForm = ref(false)

watch(() => props.modelValue, (v) => {
  if (v && props.editItem) {
    selectedDish.value = props.editItem.dish
    mealDate.value = props.editItem.date
    error.value = ""
  } else if (v) {
    selectedDish.value = null
    mealDate.value = props.date
    error.value = ""
  }
})

function onDishSelect(dish) {
  selectedDish.value = dish
}

function onDishCreated(dish) {
  selectedDish.value = dish
}

function validate() {
  if (!selectedDish.value) return "Выберите блюдо."
  if (!mealDate.value) return "Укажите дату."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    const payload = {
      dish: selectedDish.value.id,
      date: mealDate.value,
    }
    if (isEdit.value) {
      await planning.editMealPlanItem(props.editItem.id, payload)
    } else {
      await planning.addMealPlanItem(payload)
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
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.form__input {
  padding: 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
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
}

.form__submit:hover:not(:disabled) {
  background: var(--color-mint-hover);
}

.form__submit:disabled {
  opacity: 0.6;
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

  .selected-dish__clear:hover {
  background: var(--color-border);
  color: var(--color-danger);
}
</style>
