<template>
  <span class="ownership-badge" :class="isOwn ? 'ownership-badge--own' : 'ownership-badge--shared'">
    {{ isOwn ? (short ? '👤 Личное' : '👤 Личный рецепт') : (short ? '🌐 Общее' : '🌐 Общий рецепт') }}
  </span>
</template>

<script setup>
defineProps({
  isOwn: { type: Boolean, required: true },
  short: { type: Boolean, default: false },
})
</script>

<style scoped>
.ownership-badge {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  flex-shrink: 0;
  width: fit-content;
}

.ownership-badge--own {
  background: var(--color-mint-alpha-12);
  color: var(--color-mint);
}

.ownership-badge--shared {
  background: var(--color-shared-bg);
  color: var(--color-shared);
}
</style>
