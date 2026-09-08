<template>
  <div class="day-row" :class="{ 'day-row--muted': muted, 'day-row--today': isToday }">
    <div class="day-row__label">
      <div class="day-row__label-text">
        <DayBadge :day="day" :date="date.slice(0, 2)" :active="isToday" />
        <span v-if="isToday" class="day-row__today-text">Сегодня</span>
      </div>
      <button
        v-if="cookingEvents.length > 0"
        type="button"
        class="day-row__shopping-btn"
        :title="`Список покупок на ${day} ${date.slice(0, 2)}`"
        @click.stop="$emit('create-shopping-day', { rawDate, dayLabel: day })"
      >
        <IconBasket :width="22" :height="22" />
      </button>
    </div>

    <div class="day-row__cook">
      <div class="day-row__col-header">
        <IconPot :width="14" :height="14" />
        <span>Готовлю</span>
      </div>
      <div class="day-row__drop-zone">
        <div ref="cookRef" class="day-row__items" :data-date="rawDate">
          <MealCard
            v-for="event in cookingEvents"
            :key="event.id"
            :item="event"
            @tap="$emit('tap-cooking', event)"
          />
        </div>
        <button
          type="button"
          class="day-row__add day-row__add--cook"
          @click="$emit('add-cooking', rawDate)"
        >
          <span class="day-row__add-icon">+</span>
          <span class="day-row__add-text">Добавить</span>
        </button>
      </div>
    </div>

    <div class="day-row__eat">
      <div class="day-row__col-header">
        <IconFork :width="14" :height="14" />
        <span>Ем</span>
      </div>
      <div class="day-row__drop-zone">
        <div ref="eatRef" class="day-row__items" :data-date="rawDate">
          <MealCard
            v-for="item in meals"
            :key="item.id"
            :item="item"
            @tap="$emit('tap-meal', item)"
          />
        </div>
        <button
          type="button"
          class="day-row__add day-row__add--eat"
          @click="$emit('add-meal', rawDate)"
        >
          <span class="day-row__add-icon">+</span>
          <span class="day-row__add-text">Добавить</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import MealCard from "./MealCard.vue"
import DayBadge from "./DayBadge.vue"
import IconBasket from "./icons/IconBasket.vue"
import IconPot from "./icons/IconPot.vue"
import IconFork from "./icons/IconFork.vue"
import { useSortable } from "../composables/useSortable"
import { getTodayISO } from "../utils/weekDays"
import type { DTOMealPlanItem, DTOCookingEvent } from "@/types/planning"

const props = withDefaults(
  defineProps<{
    day: string
    date: string
    rawDate: string
    meals?: DTOMealPlanItem[]
    cookingEvents?: DTOCookingEvent[]
    muted?: boolean
  }>(),
  {
    meals: () => [],
    cookingEvents: () => [],
    muted: false,
  }
)

const isToday = computed(() => props.rawDate === getTodayISO())

const emit = defineEmits<{
  (e: "tap-cooking", event: DTOCookingEvent): void
  (e: "tap-meal", event: DTOMealPlanItem): void
  (e: "add-cooking", rawDate: string): void
  (e: "add-meal", rawDate: string): void
  (
    e: "drag-end",
    payload: {
      itemId: string
      fromDate: string
      toDate: string
      oldIndex: number
      newIndex: number
      type: "cooking" | "meals"
    }
  ): void
  (e: "create-shopping-day", payload: { rawDate: string; dayLabel: string }): void
}>()

const cookRef = ref<HTMLElement | null>(null)
const eatRef = ref<HTMLElement | null>(null)

function makeSortableOptions(type: "cooking" | "meals") {
  return {
    group: type,
    draggable: ".meal-card",
    ghostClass: "meal-card--ghost",
    chosenClass: "meal-card--chosen",
    dragClass: "meal-card--drag",
    animation: 150,
    delay: 150,
    delayOnTouchOnly: true,
    touchStartThreshold: 8,
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 3,
    onStart() {
      document.body.classList.add(`is-dragging-${type}`)
    },
    onEnd(evt) {
      document.body.classList.remove(`is-dragging-${type}`)

      const itemId = evt.item.dataset.id
      const fromDate = evt.from.dataset.date
      const toDate = evt.to.dataset.date
      const { oldIndex, oldDraggableIndex, newDraggableIndex } = evt

      // Revert DOM so Vue stays in control of rendering
      try {
        const { from, item } = evt
        if (item.parentNode) item.parentNode.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] || null)
      } catch {
        /* Vue re-render will reconcile */
      }

      if (fromDate === toDate && oldDraggableIndex === newDraggableIndex) return

      emit("drag-end", {
        itemId,
        fromDate,
        toDate,
        oldIndex: oldDraggableIndex,
        newIndex: newDraggableIndex,
        type,
      })
    },
  }
}

useSortable(cookRef, makeSortableOptions("cooking"))
useSortable(eatRef, makeSortableOptions("meals"))
</script>

<style lang="scss" scoped>
.day-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 8px;
  column-gap: 0;
  align-items: start;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  box-shadow: var(--shadow-day);
  transition:
    opacity var(--transition-normal),
    border-color var(--transition-normal);

  &--muted {
    opacity: 0.75;
  }

  &--today {
    border-color: var(--color-mint-alpha-25);
  }

  &__label {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  &__label-text {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
  }

  &__today-text {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--color-mint);
  }

  &__shopping-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    background: var(--color-mint-alpha-10);
    border-radius: var(--radius-sm);
    color: var(--color-mint);
    cursor: pointer;
    flex-shrink: 0;
    transition:
      color var(--transition-fast),
      background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: var(--color-mint-alpha-25);
    }

    &:active {
      background: var(--color-mint-alpha-25);
    }
  }

  &__eat,
  &__cook {
    display: flex;
    flex-direction: column;
    min-width: 0;
    padding: 4px 6px;
  }

  &__eat {
    --card-bg: var(--color-eat-bg);
    --card-accent: var(--color-eat);
    padding-left: 16px;
    border-left: 1px solid var(--color-border);
  }

  &__cook {
    --card-bg: var(--color-cook-bg);
    --card-accent: var(--color-cook);
    padding-right: 17px;
  }

  &__drop-zone {
    display: flex;
    flex-direction: column;
    justify-content: end;
    border-radius: var(--radius-xs);
    outline: 1.5px dashed transparent;
    outline-offset: 4px;
    transition: outline-color var(--transition-fast);
  }

  &__col-header {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 6px;
    font-size: var(--font-xs);
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-height: 1px;

    &:not(:empty) {
      margin-bottom: 6px;
    }
    &:empty + .day-row__add {
      margin-top: 0;
    }
  }

  &__add {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    padding: 7px;
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-xs);
    background: none;
    font-weight: 500;
    cursor: pointer;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast);
    color: var(--color-text-secondary);

    &--cook:hover {
      color: var(--color-mint);
      border-color: var(--color-mint-alpha-25);
    }
    &--eat:hover {
      color: var(--color-mint);
      border-color: var(--color-mint-alpha-25);
    }
  }

  &__add-icon {
    font-size: var(--font-base);
    line-height: 1;
  }

  &__add-text {
    font-size: var(--font-xs);
  }
}
</style>

<style lang="scss">
body.is-dragging-cooking .day-row__cook,
body.is-dragging-meals .day-row__eat {
  .day-row__drop-zone {
    outline-color: var(--color-border);
  }

  .day-row__items {
    min-height: 50px;
  }
}
</style>
