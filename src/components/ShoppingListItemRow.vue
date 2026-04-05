<template>
  <div class="item-row" :class="{ 'item-row--checked': item.is_checked }">

    <!-- Circle check -->
    <button
      class="item-row__check"
      :class="{ 'item-row__check--on': item.is_checked }"
      type="button"
      :disabled="toggling"
      @click="$emit('toggle-checked', item)"
      aria-label="Отметить как купленное"
    >
      <svg v-if="item.is_checked" width="10" height="10" viewBox="0 0 10 10" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="1 5 4 8 9 2" />
      </svg>
    </button>

    <!-- Name + sub-line -->
    <div class="item-row__info">
      <div class="item-row__name-row">
        <span class="item-row__name">{{ item.ingredient?.name ?? "—" }}</span>
        <span v-if="item.is_manual" class="item-row__manual-badge" title="Добавлено вручную">✏️</span>
      </div>
      <span v-if="isToTaste" class="item-row__taste">по вкусу</span>
    </div>

    <!-- Pill stepper (unchecked, not to_taste) -->
    <div v-if="showControls" class="item-row__stepper">
      <button
        class="item-row__step-btn"
        type="button"
        :disabled="!canDecrease"
        @click="$emit('adjust', item, -step)"
        aria-label="Уменьшить"
      >−</button>

      <div class="item-row__step-center" @click="startEdit">
        <input
          v-if="editing"
          ref="editInput"
          v-model="editValue"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          class="item-row__step-input"
          @keydown.enter.prevent="commitEdit"
          @keydown.escape.prevent="cancelEdit"
          @blur="commitEdit"
        />
        <span v-else class="item-row__step-label">{{ formatted.display }}</span>
      </div>

      <button
        class="item-row__step-btn"
        type="button"
        @click="$emit('adjust', item, step)"
        aria-label="Увеличить"
      >+</button>
    </div>

    <!-- Static amount when checked or no controls -->
    <span v-else-if="!isToTaste" class="item-row__amount-done">{{ formatted.display }}</span>

    <!-- Delete -->
    <button
      class="item-row__delete"
      type="button"
      @click="$emit('delete', item)"
      aria-label="Удалить"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
      </svg>
    </button>

  </div>
</template>

<script setup>
import { computed, ref, nextTick } from "vue"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { getUnitStep } from "../utils/unitSteps"

const props = defineProps({
  item: { type: Object, required: true },
})

const emit = defineEmits(["toggle-checked", "adjust", "delete"])

const toggling = ref(false)
const editing = ref(false)
const editValue = ref("")
const editInput = ref(null)

const baseUnit = computed(() => props.item.ingredient?.base_unit ?? "piece")
const step = computed(() => getUnitStep(baseUnit.value))
const isToTaste = computed(() => baseUnit.value === "to_taste")
const showControls = computed(() => !isToTaste.value && !props.item.is_checked)
const canDecrease = computed(() => parseFloat(props.item.amount) > step.value)
const formatted = computed(() => formatShoppingAmount(props.item.amount, baseUnit.value))

function startEdit() {
  editValue.value = formatted.value.number || ""
  editing.value = true
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

// Display-to-raw multipliers (mirror of formatShoppingAmount CONVERSION_RULES)
const DISPLAY_MULTIPLIERS = [
  { unit: "gram",       threshold: 1000, multiplier: 1000 },
  { unit: "milliliter", threshold: 1000, multiplier: 1000 },
  { unit: "milligram",  threshold: 1000, multiplier: 1000 },
]

function commitEdit() {
  if (!editing.value) return
  editing.value = false
  const raw = editValue.value.trim().replace(",", ".")
  const numDisplay = parseFloat(raw)
  if (!raw || isNaN(numDisplay) || numDisplay <= 0) return

  const currentRaw = parseFloat(props.item.amount)
  const rule = DISPLAY_MULTIPLIERS.find(
    r => r.unit === baseUnit.value && currentRaw >= r.threshold
  )
  const newRaw = parseFloat((numDisplay * (rule ? rule.multiplier : 1)).toFixed(4))
  const delta = parseFloat((newRaw - currentRaw).toFixed(4))
  if (Math.abs(delta) < 0.0001) return
  emit("adjust", props.item, delta)
}

function cancelEdit() {
  editing.value = false
}
</script>

<style scoped>
.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  transition: opacity 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.item-row--checked {
  opacity: 0.5;
}

/* ── Checkbox ── */
.item-row__check {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1.8px solid var(--color-border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.item-row__check--on {
  border-color: var(--color-eat);
  background: var(--color-eat);
  color: #fff;
}

.item-row__check:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Info ── */
.item-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.item-row__name-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.item-row__name {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
}

.item-row--checked .item-row__name {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.item-row__manual-badge {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 1;
}

.item-row__taste {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-style: italic;
}

/* ── Pill stepper ── */
.item-row__stepper {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 34px;
  border: 1.5px solid var(--color-border);
  border-radius: 100px;
  overflow: hidden;
  background: var(--color-surface);
}

.item-row__step-btn {
  width: 32px;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 17px;
  font-weight: 400;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.12s;
}

.item-row__step-btn:active {
  background: var(--color-empty);
}

.item-row__step-btn:disabled {
  color: var(--color-border);
  cursor: default;
}

.item-row__step-center {
  min-width: 58px;
  height: 100%;
  border-left: 1px solid var(--color-border);
  border-right: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  cursor: text;
}

.item-row__step-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  text-align: center;
  user-select: none;
}

.item-row__step-input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
  font-family: inherit;
  padding: 0;
  caret-color: var(--color-mint);
}

/* ── Checked amount / to_taste done ── */
.item-row__amount-done {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ── Delete ── */
.item-row__delete {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.3;
  cursor: pointer;
  border-radius: 50%;
  transition: opacity 0.15s, background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.item-row__delete:active,
.item-row__delete:hover {
  opacity: 1;
  color: var(--color-danger);
  background: var(--color-danger-pale);
}
</style>

