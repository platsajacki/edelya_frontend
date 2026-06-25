<template>
  <div class="item-row" :class="{ 'item-row--checked': item.is_checked }">
    <!-- Circle check -->
    <button
      class="item-row__check"
      :class="{ 'item-row__check--on': item.is_checked }"
      type="button"
      :disabled="toggling"
      aria-label="Отметить как купленное"
      @click="$emit('toggle-checked', item)"
    >
      <IconCheck v-if="item.is_checked" :width="10" :height="10" />
    </button>

    <!-- Name + sub-line -->
    <div class="item-row__info">
      <div class="item-row__name-row">
        <span class="item-row__name">{{ item.ingredient?.name ?? "—" }}</span>
        <span v-if="item.is_manual" class="item-row__manual-badge" title="Добавлено вручную"
          >✏️</span
        >
      </div>
      <span v-if="isToTaste" class="item-row__taste">по вкусу</span>
    </div>

    <!-- Pill stepper (unchecked, not to_taste) -->
    <div v-if="showControls" class="item-row__stepper">
      <button
        class="item-row__step-btn"
        type="button"
        :disabled="!canDecrease"
        aria-label="Уменьшить"
        @click="$emit('adjust', item, -step)"
      >
        −
      </button>

      <div class="item-row__step-center" @click="startEdit">
        <input
          v-if="editing"
          v-model="editValue"
          v-autofocus.select
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
        aria-label="Увеличить"
        @click="$emit('adjust', item, step)"
      >
        +
      </button>
    </div>

    <!-- Static amount when checked or no controls -->
    <span v-else-if="!isToTaste" class="item-row__amount-done">{{ formatted.display }}</span>

    <!-- Delete -->
    <button
      class="item-row__delete"
      type="button"
      aria-label="Удалить"
      @click="$emit('delete', item)"
    >
      <IconClose :width="10" :height="10" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { AutoFocusDirective as vAutofocus } from "@/directives/autofocus"
import { computed, ref } from "vue"
import IconCheck from "./icons/IconCheck.vue"
import IconClose from "./icons/IconClose.vue"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { getUnitStep } from "../utils/unitSteps"
import type { DTOShoppingListItem } from "@/types/shopping"

const props = defineProps<{
  item: DTOShoppingListItem
}>()

const emit = defineEmits<{
  (e: "toggle-checked", item: DTOShoppingListItem): void
  (e: "adjust", item: DTOShoppingListItem, delta: number): void
  (e: "delete", item: DTOShoppingListItem): void
}>()

const toggling = ref(false)
const editing = ref(false)
const editValue = ref("")

const baseUnit = computed(() => props.item.ingredient?.base_unit ?? "piece")
const step = computed(() => getUnitStep(baseUnit.value))
const isToTaste = computed(() => baseUnit.value === "to_taste")
const showControls = computed(() => !isToTaste.value && !props.item.is_checked)
const canDecrease = computed(() => parseFloat(props.item.amount) > step.value)
const formatted = computed(() => formatShoppingAmount(props.item.amount, baseUnit.value))

function startEdit() {
  editValue.value = formatted.value.number || ""
  editing.value = true
}

// Display-to-raw multipliers (mirror of formatShoppingAmount CONVERSION_RULES)
const DISPLAY_MULTIPLIERS = [
  { unit: "gram", threshold: 1000, multiplier: 1000 },
  { unit: "milliliter", threshold: 1000, multiplier: 1000 },
  { unit: "milligram", threshold: 1000, multiplier: 1000 },
]

function commitEdit() {
  if (!editing.value) return
  editing.value = false
  const raw = editValue.value.trim().replace(",", ".")
  const numDisplay = parseFloat(raw)
  if (!raw || isNaN(numDisplay) || numDisplay <= 0) return

  const currentRaw = parseFloat(props.item.amount)
  const rule = DISPLAY_MULTIPLIERS.find(
    (r) => r.unit === baseUnit.value && currentRaw >= r.threshold
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

<style lang="scss" scoped>
.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  transition: opacity var(--transition-normal);
  -webkit-tap-highlight-color: transparent;

  &--checked {
    opacity: 0.5;

    .item-row__name {
      text-decoration: line-through;
      color: var(--color-text-secondary);
    }
  }

  &__check {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1.8px solid var(--color-border);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    transition:
      border-color var(--transition-fast),
      background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &--on {
      border-color: var(--color-eat);
      background: var(--color-eat);
      color: var(--on-primary);
    }

    &:disabled {
      opacity: 0.5;
      cursor: default;
      pointer-events: none;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  &__name-row {
    display: flex;
    align-items: center;
    gap: 5px;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-base);
    font-weight: 500;
    color: var(--color-text);
    word-break: break-word;
    overflow-wrap: break-word;
  }

  &__manual-badge {
    flex-shrink: 0;
    font-size: var(--font-sm);
    line-height: 1;
  }

  &__taste {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  &__stepper {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    height: 34px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-pill);
    overflow: hidden;
    background: var(--color-surface);
  }

  &__step-btn {
    min-width: 44px;
    height: 100%;
    border: none;
    background: transparent;
    font-size: var(--font-lg);
    font-weight: 400;
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
    transition: background var(--transition-fast);

    &:active {
      background: var(--color-empty);
    }
    &:disabled {
      color: var(--color-border);
      cursor: default;
    }
  }

  &__step-center {
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

  &__step-label {
    font-size: var(--font-2xs);
    font-weight: 600;
    color: var(--color-text);
    white-space: nowrap;
    text-align: center;
    user-select: none;
  }

  &__step-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: var(--font-2xs);
    font-weight: 600;
    color: var(--color-text);
    text-align: center;
    font-family: inherit;
    padding: 0;
    caret-color: var(--color-mint);
  }

  &__amount-done {
    flex-shrink: 0;
    font-size: var(--font-2xs);
    color: var(--color-text-secondary);
    white-space: nowrap;
  }

  &__delete {
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
    transition:
      opacity var(--transition-fast),
      background var(--transition-fast),
      color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active,
    &:hover {
      opacity: 1;
      color: var(--color-danger);
      background: var(--color-danger-pale);
    }
  }
}
</style>
