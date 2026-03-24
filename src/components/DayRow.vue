<template>
    <div class="day-row">
        <div class="day-row__label">
          <span class="day-row__day">{{ day }}</span>
          <span class="day-row__date">{{ date.slice(0, 2) }}</span>
        </div>

        <div ref="cookRef" class="day-row__cook" :data-date="rawDate">
          <MealCard
            v-for="event in cookingEvents"
            :key="event.id"
            :item="event"
            @tap="$emit('tap-cooking', $event)"
          />
          <button type="button" class="day-row__add day-row__add--cook" @click="$emit('add-cooking', rawDate)">
            <span class="day-row__add-icon">+</span>
            <span class="day-row__add-text">Добавить</span>
          </button>
        </div>

        <div ref="eatRef" class="day-row__eat" :data-date="rawDate">
          <MealCard
            v-for="item in meals"
            :key="item.id"
            :item="item"
            @tap="$emit('tap-meal', $event)"
          />
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
import { useSortable } from '../composables/useSortable'

const props = defineProps({
  day: { type: String, required: true },
  date: { type: String, required: true },
  rawDate: { type: String, required: true },
  meals: { type: Array, default: () => [] },
  cookingEvents: { type: Array, default: () => [] },
})

const emit = defineEmits(["tap-cooking", "tap-meal", "add-cooking", "add-meal", "drag-end"])

const cookRef = ref(null)
const eatRef = ref(null)

function makeSortableOptions(type) {
  return {
    group: type,
    draggable: '.meal-card',
    filter: '.day-row__add',
    preventOnFilter: false,
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
    emptyInsertThreshold: 20,
    onEnd(evt) {
      const itemId = evt.item.dataset.id
      const fromDate = evt.from.dataset.date
      const toDate = evt.to.dataset.date
      const { oldIndex, oldDraggableIndex, newDraggableIndex } = evt

      // Revert DOM so Vue stays in control of rendering
      const { from, to, item } = evt
      if (from !== to) {
        to.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] || null)
      } else {
        from.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] || null)
      }

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
  grid-template-columns: 36px 1fr 1fr;
  column-gap: 12px;
  row-gap: 12px;
  align-items: start;
  padding: 12px 16px;
  min-height: 56px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-day);
}

.day-row__label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-top: 1px;
  padding-right: 8px;
  text-align: center;
  line-height: 1;
  border-right: 1px solid var(--color-border);
}

.day-row__day {
  font-weight: 700;
  font-size: 13px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.day-row__date {
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-secondary);
}

.day-row__eat {
  --card-bg: var(--color-eat-bg);
  --card-accent: var(--color-eat);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  padding-left: 8px;
  min-height: 40px;
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
  gap: 8px;
  min-height: 40px;
}

.day-row__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  padding: 8px 0;
  border: 1.5px dashed var(--color-border);
  border-radius: var(--radius-sm);
  background: none;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  color: var(--color-text-secondary);
}

.day-row__add-icon {
  font-size: 15px;
  line-height: 1;
}

.day-row__add-text {
  font-size: 11px;
}

.day-row__add--cook:hover {
  border-color: var(--color-cook);
  color: var(--color-cook);
  background: var(--color-cook-bg);
}

.day-row__add--eat:hover {
  border-color: var(--color-eat);
  color: var(--color-eat);
  background: var(--color-eat-bg);
}
</style>
