<template>
  <div class="multi-day-picker">
    <div class="multi-day-picker__chips">
      <button
        v-for="day in days"
        :key="day.iso"
        type="button"
        class="multi-day-picker__chip"
        :class="{
          'multi-day-picker__chip--selected': modelValue.includes(day.iso),
        }"
        @click="toggle(day.iso)"
      >
        <span class="multi-day-picker__weekday">{{ day.weekday }}</span>
        <span class="multi-day-picker__date">{{ day.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"

const WEEKDAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"]

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  startDate: { type: String, default: "" },
})

const emit = defineEmits(["update:modelValue"])

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const days = computed(() => {
  const start = new Date((props.startDate || todayISO()) + "T00:00:00")
  const result = []

  for (let i = 0; i < 8; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    result.push({
      iso,
      weekday: WEEKDAYS[d.getDay()],
      label: `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`,
    })
  }

  return result
})

function toggle(iso) {
  const idx = props.modelValue.indexOf(iso)
  const next = [...props.modelValue]
  if (idx >= 0) {
    next.splice(idx, 1)
  } else {
    next.push(iso)
  }
  emit("update:modelValue", next)
}
</script>

<style scoped>
.multi-day-picker__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.multi-day-picker__chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  min-width: 48px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}

.multi-day-picker__chip:hover:not(:disabled) {
  background: var(--color-mint-alpha-06);
  border-color: var(--color-mint);
}

.multi-day-picker__chip--selected {
  background: var(--color-mint);
  border-color: var(--color-mint);
  color: var(--on-primary);
  transform: scale(1.05);
  box-shadow: 0 2px 8px var(--color-mint-alpha-25);
}

.multi-day-picker__chip--selected:hover:not(:disabled) {
  background: var(--color-mint-hover);
  border-color: var(--color-mint-hover);
  color: var(--on-primary);
  transform: scale(1.05);
  box-shadow: 0 2px 8px var(--color-mint-alpha-25);
}


.multi-day-picker__weekday {
  font-size: var(--font-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.multi-day-picker__date {
  font-size: var(--font-sm);
  font-weight: 500;
}
</style>
