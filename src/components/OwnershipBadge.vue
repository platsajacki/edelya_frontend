<template>
  <span class="ownership-badge" :class="isOwn ? 'ownership-badge--own' : 'ownership-badge--shared'">
    <span aria-hidden="true">{{ isOwn ? "👤" : "🌐" }}</span>
    {{ label }}
  </span>
</template>

<script lang="ts" setup>
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    isOwn: boolean
    short?: boolean
    ownLabel?: string
    sharedLabel?: string
  }>(),
  {
    short: false,
    ownLabel: undefined,
    sharedLabel: undefined,
  }
)

const label = computed(() => {
  if (props.isOwn) return props.ownLabel ?? (props.short ? "Личное" : "Личный рецепт")
  return props.sharedLabel ?? (props.short ? "Общее" : "Общий рецепт")
})
</script>

<style lang="scss" scoped>
.ownership-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25em;
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
  width: fit-content;

  &--own {
    background: var(--color-mint-alpha-12);
    color: var(--color-mint-dark);
  }
  &--shared {
    background: var(--color-shared-bg);
    color: var(--color-shared);
  }
}
</style>
