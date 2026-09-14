<template>
  <span class="ownership-badge" :class="isOwn ? 'ownership-badge--own' : 'ownership-badge--shared'">
    <span aria-hidden="true">{{ isOwn ? "👤" : "🌐" }}</span>
    {{ isOwn ? (short ? "Личное" : "Личный рецепт") : short ? "Общее" : "Общий рецепт" }}
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    isOwn: boolean
    short?: boolean
  }>(),
  {
    short: false,
  }
)
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
