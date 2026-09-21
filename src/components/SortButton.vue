<template>
  <button class="sort-button" type="button">
    <IconSort />
    {{ label }}
  </button>
</template>

<script lang="ts" setup>
import IconSort from "./icons/IconSort.vue"

defineProps<{
  label: string
}>()
</script>

<style lang="scss" scoped>
.sort-button {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  &:active {
    color: var(--color-mint-dark);
    border-color: var(--color-mint);
  }
}
</style>
