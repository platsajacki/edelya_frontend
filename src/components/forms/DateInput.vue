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
    <button type="button" class="date-input__btn" @click="openPicker">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    </button>
    <input
      ref="pickerRef"
      :value="modelValue"
      type="date"
      class="date-input__picker"
      tabindex="-1"
      @input="onPickerInput"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue"

const props = defineProps({
  modelValue: { type: String, default: "" },
  required: { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue"])

const displayValue = computed(() => {
  if (!props.modelValue) return ""
  const [y, m, d] = props.modelValue.split("-")
  if (!y || !m || !d) return props.modelValue
  return `${d.padStart(2, "0")}.${m.padStart(2, "0")}.${y}`
})

function onTextInput(e) {
  let v = e.target.value.replace(/[^\d.]/g, "")

  // Auto-insert dots after DD and MM
  const digits = v.replace(/\./g, "")
  if (digits.length >= 4) {
    v = digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4, 8)
  } else if (digits.length >= 2) {
    v = digits.slice(0, 2) + "." + digits.slice(2)
  }

  e.target.value = v

  const match = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (match) {
    const [, d, m, y] = match
    emit("update:modelValue", `${y}-${m}-${d}`)
  }
}

function onBlur(e) {
  // Restore formatted value on blur
  e.target.value = displayValue.value
}

const pickerRef = ref(null)

function openPicker() {
  pickerRef.value?.showPicker()
}

function onPickerInput(e) {
  emit("update:modelValue", e.target.value)
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
  font-size: 15px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.date-input__text:focus {
  border-color: var(--color-mint);
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
}

.date-input__btn svg {
  width: 18px;
  height: 18px;
}

.date-input__picker {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
  border: none;
  padding: 0;
}
</style>
