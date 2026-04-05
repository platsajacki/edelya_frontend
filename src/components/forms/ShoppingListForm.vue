<template>
  <ModalWrapper v-model="open" :title="isEdit ? 'Редактировать список' : 'Новый список покупок'" :z-index="zIndex">
    <form class="form" @submit.prevent="submit">
      <label class="form__field">
        <span class="form__label">Название <span class="form__required">*</span></span>
        <input v-model="name" type="text" class="form__input" required placeholder="Например: Продукты на неделю" />
      </label>

      <label class="form__field">
        <span class="form__label">Начало периода <span class="form__required">*</span></span>
        <DateInput v-model="dateFrom" />
      </label>

      <label class="form__field">
        <span class="form__label">Конец периода <span class="form__required">*</span></span>
        <DateInput v-model="dateTo" />
      </label>

      <div v-if="isEdit && datesChanged" class="form__warning">
        <IconWarning width="14" height="14" />
        При сохранении список покупок будет пересчитан на основе готовок за новый период.
      </div>

      <div v-if="error" class="form__error">{{ error }}</div>

      <button type="submit" class="form__submit" :disabled="saving">
        {{ saving ? "Сохранение..." : (isEdit ? "Сохранить" : "Создать") }}
      </button>
    </form>
  </ModalWrapper>
</template>

<script setup>
import { ref, computed, watch } from "vue"
import ModalWrapper from "./ModalWrapper.vue"
import DateInput from "./DateInput.vue"
import { useShoppingStore } from "../../store/shopping"
import IconWarning from "../icons/IconWarning.vue"

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  zIndex: { type: Number, default: 1010 },
  editList: { type: Object, default: null },
})

const emit = defineEmits(["update:modelValue", "created", "updated"])

const isEdit = computed(() => !!props.editList)

const datesChanged = computed(() => {
  if (!props.editList) return false
  return dateFrom.value !== props.editList.date_from || dateTo.value !== props.editList.date_to
})

const open = ref(props.modelValue)
watch(() => props.modelValue, (v) => { open.value = v })
watch(open, (v) => { emit("update:modelValue", v) })

const name = ref("")
const dateFrom = ref("")
const dateTo = ref("")
const saving = ref(false)
const error = ref("")

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

watch(() => props.modelValue, (v) => {
  if (v) {
    error.value = ""
    if (props.editList) {
      name.value = props.editList.name || ""
      dateFrom.value = props.editList.date_from || ""
      dateTo.value = props.editList.date_to || ""
    } else {
      name.value = ""
      dateFrom.value = todayISO()
      dateTo.value = ""
    }
  }
})

function validate() {
  if (!name.value.trim()) return "Укажите название списка."
  if (!dateFrom.value) return "Укажите дату начала периода."
  if (!dateTo.value) return "Укажите дату конца периода."
  if (dateTo.value < dateFrom.value) return "Дата конца не может быть раньше даты начала."
  return null
}

async function submit() {
  error.value = validate()
  if (error.value) return
  saving.value = true
  try {
    const payload = {
      name: name.value.trim(),
      date_from: dateFrom.value,
      date_to: dateTo.value,
    }
    const store = useShoppingStore()
    if (isEdit.value) {
      const data = await store.updateList(props.editList.id, payload)
      emit("updated", data)
    } else {
      const data = await store.createList(payload)
      emit("created", data)
    }
    open.value = false
  } catch (err) {
    error.value = err.message || "Не удалось сохранить список"
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

.form__warning {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 13px;
  color: #92661a;
  background: #fef9ec;
  border: 1px solid #f3d98a;
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  line-height: 1.45;
}

.form__warning svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: #c47f0a;
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
