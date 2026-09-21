<template>
  <button type="button" class="dev-button">
    <slot />
  </button>
</template>

<style lang="scss" scoped>
.dev-button {
  padding: var(--btn-padding-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--font-sm);
}
</style>
