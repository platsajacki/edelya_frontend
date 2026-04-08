<template>
    <div class="day-row" :class="{ 'day-row--muted': muted }">
        <div class="day-row__label">
          <div class="day-row__label-text">
            <span class="day-row__day">{{ day }}</span>
            <span class="day-row__date">{{ date.slice(0, 2) }}</span>
          </div>
          <button
            type="button"
            class="day-row__shopping-btn"
            :title="`Список покупок на ${day} ${date.slice(0, 2)}`"
            @click.stop="$emit('create-shopping-day', { rawDate, dayLabel: day })"
          >
            <IconShoppingBag :width="16" :height="16" :stroke-width="1.5" />
          </button>
        </div>

        <div class="day-row__cook">
          <div ref="cookRef" class="day-row__items" :data-date="rawDate">
            <MealCard
              v-for="event in cookingEvents"
              :key="event.id"
              :item="event"
              @tap="$emit('tap-cooking', $event)"
            />
          </div>
          <button type="button" class="day-row__add day-row__add--cook" @click="$emit('add-cooking', rawDate)">
            <span class="day-row__add-icon">+</span>
            <span class="day-row__add-text">Добавить</span>
          </button>
        </div>

        <div class="day-row__eat">
          <div ref="eatRef" class="day-row__items" :data-date="rawDate">
            <MealCard
              v-for="item in meals"
              :key="item.id"
              :item="item"
              @tap="$emit('tap-meal', $event)"
            />
          </div>
          <button type="button" class="day-row__add day-row__add--eat" @click="$emit('add-meal', rawDate)">
            <span class="day-row__add-icon">+</span>
            <span class="day-row__add-text">Добавить</span>
          </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import MealCard from './MealCard.vue'
import IconShoppingBag from './icons/IconShoppingBag.vue'
import { useSortable } from '../composables/useSortable'

const props = defineProps({
  day: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String, required: true },
  meals: { type: Array, default: () => [] },
  cookingEvents: { type: Array, default: () => [] },
  muted: { type: Boolean, default: false },
})

const emit = defineEmits(["tap-cooking", "tap-meal", "add-cooking", "add-meal", "drag-end", "create-shopping-day"])

const cookRef = ref(null)
const eatRef = ref(null)

function makeSortableOptions(type) {
  return {
    group: type,
    draggable: '.meal-card',
    ghostClass: 'meal-card--ghost',
    chosenClass: 'meal-card--chosen',
    dragClass: 'meal-card--drag',
    animation: 150,
    delay: 150,
    delayOnTouchOnly: true,
    touchStartThreshold: 8,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 3,
    onEnd(evt) {
      const itemId = evt.item.dataset.id
      const fromDate = evt.from.dataset.date
      const toDate = evt.to.dataset.date
      const { oldIndex, oldDraggableIndex, newDraggableIndex } = evt

      // Revert DOM so Vue stays in control of rendering
      try {
        const { from, item } = evt
        if (item.parentNode) item.parentNode.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] || null)
      } catch { /* Vue re-render will reconcile */ }

      if (fromDate === toDate && oldDraggableIndex === newDraggableIndex) return

      emit('drag-end', { itemId, fromDate, toDate, oldIndex: oldDraggableIndex, newIndex: newDraggableIndex, type })
    },
  }
}

useSortable(cookRef, makeSortableOptions('cooking'))
useSortable(eatRef, makeSortableOptions('meals'))
</script>

<style scoped>
.day-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
  row-gap: 8px;
  align-items: start;
  padding: 6px 16px 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-day);
  transition: opacity var(--transition-normal);
}

.day-row--muted {
  opacity: 0.75;
}

.day-row__label {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4px;
  line-height: 1;
  border-bottom: 1px solid var(--color-border);
}

.day-row__label-text {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 4px;
}

.day-row__shopping-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: none;
  border-radius: var(--radius-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition: color var(--transition-fast), background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.day-row__shopping-btn:hover {
  color: var(--color-mint);
  background: color-mix(in srgb, var(--color-mint) 10%, transparent);
}

.day-row__shopping-btn:active {
  background: var(--color-empty);
}

.day-row__day {
  font-weight: 550;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.day-row__date {
  font-weight: 550;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.day-row__eat {
  --card-bg: var(--color-eat-bg);
  --card-accent: var(--color-eat);
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 8px;
}

.day-row__eat::before {
  content: '';
  position: absolute;
  left: -6px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
}

.day-row__cook {
  --card-bg: var(--color-cook-bg);
  --card-accent: var(--color-cook);
  display: flex;
  flex-direction: column;
}

.day-row__items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 1px;
}

.day-row__items:not(:empty) {
  margin-bottom: 8px;
}

.day-row__items:empty + .day-row__add {
  margin-top: 0;
}

.day-row__add {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 3px;
  width: 100%;
  padding: 6px;
  border: none;
  background: none;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-fast);
  color: var(--color-text-secondary);
}

.day-row__add-icon {
  font-size: var(--font-base);
  line-height: 1;
}

.day-row__add-text {
  font-size: var(--font-xs);
}

.day-row__add--cook:hover {
  color: var(--color-mint);
}

.day-row__add--eat:hover {
  color: var(--color-mint);
}
</style>
