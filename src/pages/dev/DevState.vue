<template>
  <div class="dev-state">
    <span class="dev-state__label">{{ label }}</span>
    <div class="dev-state__content" :class="{ 'dev-state__content--row': row }">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    label: string
    row?: boolean
  }>(),
  { row: false }
)
</script>

<style lang="scss" scoped>
.dev-state {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);

  &__label {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    font-family: monospace;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--row {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
    }
  }
}
</style>
