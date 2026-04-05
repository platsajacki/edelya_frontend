<template>
  <div class="item-row" :class="{ 'item-row--checked': item.is_checked }">
    <button
      class="item-row__check"
      :class="{ 'item-row__check--active': item.is_checked }"
      type="button"
      :disabled="toggling"
      @click="$emit('toggle-checked', item)"
      aria-label="Отметить как купленное"
    >
      <svg v-if="item.is_checked" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" />
      </svg>
    </button>

    <div class="item-row__info">
      <span class="item-row__name">{{ item.ingredient?.name ?? "—" }}</span>
      <span v-if="item.is_manual" class="item-row__badge">вручную</span>
    </div>

    <div class="item-row__amount">
      <span class="item-row__value">{{ formatted.display }}</span>
    </div>

    <div v-if="showControls" class="item-row__controls">
      <button
        class="item-row__btn item-row__btn--minus"
        type="button"
        :disabled="!canDecrease"
        @click="$emit('adjust', item, -step)"
        aria-label="Уменьшить"
      >−</button>
      <button
        class="item-row__btn item-row__btn--plus"
        type="button"
        @click="$emit('adjust', item, step)"
        aria-label="Увеличить"
      >+</button>
    </div>

    <button
      class="item-row__delete"
      type="button"
      @click="$emit('delete', item)"
      aria-label="Удалить"
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6.5 7v4M9.5 7v4M4.5 4l.5 9a1 1 0 001 1h4a1 1 0 001-1l.5-9"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import { getUnitStep } from "../utils/unitSteps"

const props = defineProps({
  item: { type: Object, required: true },
})

defineEmits(["toggle-checked", "adjust", "delete"])

const toggling = ref(false)

const baseUnit = computed(() => props.item.ingredient?.base_unit ?? "piece")

const step = computed(() => getUnitStep(baseUnit.value))

const showControls = computed(() => step.value > 0 && !props.item.is_checked)

const canDecrease = computed(() => {
  const current = parseFloat(props.item.amount)
  return current > step.value
})

const formatted = computed(() =>
  formatShoppingAmount(props.item.amount, baseUnit.value)
)
</script>

<style scoped>
.item-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.15s, opacity 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.item-row--checked {
  opacity: 0.55;
}

.item-row__check {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: border-color 0.15s, background 0.15s;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.item-row__check--active {
  border-color: var(--color-eat);
  background: var(--color-eat);
  color: #fff;
}

.item-row__check:disabled {
  opacity: 0.5;
  cursor: default;
}

.item-row__info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.item-row__name {
  font-size: var(--font-md);
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-row--checked .item-row__name {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.item-row__badge {
  flex-shrink: 0;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--color-empty);
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.item-row__amount {
  flex-shrink: 0;
  text-align: right;
  min-width: 52px;
}

.item-row__value {
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.item-row--checked .item-row__value {
  color: var(--color-text-secondary);
}

.item-row__controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.item-row__btn {
  width: 44px;
  height: 44px;
  border: 1.5px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}

.item-row__btn:active {
  background: var(--color-empty);
}

.item-row__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.item-row__btn--minus {
  color: var(--color-danger);
}

.item-row__btn--plus {
  color: var(--color-eat);
}

.item-row__delete {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  opacity: 0.45;
  transition: opacity 0.12s, color 0.12s, background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.item-row__delete:hover {
  opacity: 1;
  color: var(--color-danger);
  background: var(--color-danger-pale);
}

.item-row__delete:active {
  opacity: 1;
  color: var(--color-danger);
}
</style>
