<template>
  <div class="multi-day-picker">
    <div class="multi-day-picker__chips">
      <button
        v-for="day in days"
        :key="day.iso"
        type="button"
        class="multi-day-picker__chip"
        @click="toggle(day.iso)"
      >
        <DayBadge :day="day.weekday" :date="day.label" :active="modelValue.includes(day.iso)" />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import DayBadge from "../DayBadge.vue"

const WEEKDAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"]

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    startDate?: string
  }>(),
  {
    startDate: "",
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void
}>()

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

const days = computed(() => {
  const start = new Date((props.startDate || todayISO()) + "T00:00:00")
  const result: { iso: string; weekday: string; label: string }[] = []

  for (let i = 0; i < 8; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    result.push({
      iso,
      weekday: WEEKDAYS[d.getDay()],
      label: `${String(d.getDate()).padStart(2, "0")}`,
    })
  }

  return result
})

function toggle(iso: string) {
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

<style lang="scss" scoped>
.multi-day-picker {
  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__chip {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
    transition: transform var(--transition-fast);

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }
  }
}
</style>
