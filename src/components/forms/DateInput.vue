<template>
  <div class="date-input">
    <input
      ref="textRef"
      :value="displayValue"
      type="text"
      inputmode="numeric"
      placeholder="ДД.ММ.ГГГГ"
      class="date-input__text"
      maxlength="10"
      :required="required"
      @input="onTextInput"
      @blur="onBlur"
    />
    <button type="button" class="date-input__btn" aria-label="Выбрать дату">
      <IconCalendar />
      <input
        ref="pickerRef"
        :value="modelValue"
        type="date"
        class="date-input__picker"
        tabindex="-1"
        @input="onPickerInput"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue"
import IconCalendar from "../icons/IconCalendar.vue"

const props = withDefaults(
  defineProps<{
    modelValue?: string
    required?: boolean
  }>(),
  { modelValue: "", required: false }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void
}>()

const displayValue = computed(() => {
  if (!props.modelValue) return ""
  const [y, m, d] = props.modelValue.split("-")
  if (!y || !m || !d) return props.modelValue
  return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`
})

function onTextInput(e: Event) {
  const input = e.target as HTMLInputElement
  let v = input.value.replace(/[^\d.]/g, "")

  const digits = v.replace(/\./g, "")
  if (digits.length >= 4) {
    v = digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4, 8)
  } else if (digits.length >= 2) {
    v = digits.slice(0, 2) + "." + digits.slice(2)
  }

  input.value = v

  const match = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (match) {
    const [, d, m, y] = match
    emit("update:modelValue", `${y}-${m}-${d}`)
  }
}

function onBlur(e: FocusEvent) {
  ;(e.target as HTMLInputElement).value = displayValue.value
}

const pickerRef = ref<HTMLInputElement | null>(null)

function onPickerInput(e: Event) {
  emit("update:modelValue", (e.target as HTMLInputElement).value)
}
</script>

<style scoped>
.date-input {
  position: relative;
}

.date-input__text {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  box-sizing: border-box;
}

.date-input__text:focus {
  border-color: var(--color-mint-alpha-25);
  box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
}

.date-input__btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  overflow: hidden;
}

.date-input__btn svg {
  width: 18px;
  height: 18px;
  pointer-events: none;
}

.date-input__picker {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  border: none;
  padding: 0;
  cursor: pointer;
}
</style>
