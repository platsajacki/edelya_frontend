<template>
  <button
    class="meal-card"
    :class="{
      'meal-card--shared': !isOwn && !isManual,
      'meal-card--manual': isManual,
      'meal-card--saving': isPending,
    }"
    :style="cardStyle"
    type="button"
    :data-id="item.id"
    @click="$emit('tap', item)"
  >
    <span class="meal-card__name">{{ item.dish.name }}</span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { isDishOwn } from "../utils/dishOwnership"
import { usePlanningStore } from "../store/planning"
import type { DTOMealPlanItem, DTOCookingEvent } from "@/types/planning"

type CardItem = DTOMealPlanItem | DTOCookingEvent

const props = defineProps<{
  item: CardItem
}>()

defineEmits<{
  (e: "tap", item: CardItem): void
}>()

const isOwn = computed(() => isDishOwn(props.item.dish))
const isManual = computed(() => "is_manual" in props.item && props.item.is_manual === true)

const planning = usePlanningStore()
const isPending = computed(() => planning.savingItemIds.includes(props.item.id))

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const cardStyle = computed(() => {
  if (!props.item.color) return {}
  return {
    "--card-accent": props.item.color,
    "--card-bg": hexToRgba(props.item.color, 0.2),
  }
})
</script>

<style lang="scss" scoped>
.meal-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--card-bg, var(--color-empty));
  border: none;
  border-left: 3px solid var(--card-accent, var(--color-mint));
  font-size: var(--font-sm);
  text-align: left;
  cursor: pointer;
  transition:
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;

  &--shared {
    border-left-color: var(--card-accent, var(--color-shared-accent));
  }

  &--manual {
    border-left-color: var(--card-accent, var(--color-manual-meal));
    background: var(--color-manual-meal-bg);
  }

  &:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-mint-alpha-10);
  }

  &--ghost {
    opacity: 0.5;
    border: 2px dashed var(--card-accent, var(--color-mint));
    background: var(--card-bg, var(--color-empty));
  }

  &--chosen {
    box-shadow: var(--shadow-elevated);
    transform: scale(1.02);
    cursor: grabbing;
    transition: none;
  }

  &--drag {
    opacity: 0.9;
    transform: rotate(2deg);
    box-shadow: var(--shadow-drag);
    transition: none;
  }

  &--saving {
    opacity: 0.65;
    pointer-events: none;
  }

  &__name {
    font-weight: 500;
    line-height: 1.3;
    color: var(--color-text);
    min-width: 0;
    -webkit-hyphens: auto;
    hyphens: auto;
    overflow-wrap: break-word;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.sortable-fallback {
  touch-action: none;
  transition: none;
}
</style>
