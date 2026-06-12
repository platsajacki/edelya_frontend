<template>
  <div v-if="visible" class="ai-usage" :class="{ 'ai-usage--empty': isEmpty }">
    <div class="ai-usage__main">
      <span class="ai-usage__title">AI-рецепты</span>
      <span class="ai-usage__value">{{ usageText }}</span>
    </div>
    <span v-if="remainingText" class="ai-usage__remaining">{{ remainingText }}</span>
  </div>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  usage: { type: Object, default: null },
  limit: { type: Number, default: null },
})

const resolvedLimit = computed(() => props.usage?.limit ?? props.limit)
const hasUsage = computed(() => props.usage?.used !== undefined && props.usage?.used !== null)
const visible = computed(() => hasUsage.value || resolvedLimit.value !== null)
const isEmpty = computed(() => props.usage?.remaining !== undefined && Number(props.usage.remaining) <= 0)

const usageText = computed(() => {
  if (hasUsage.value && resolvedLimit.value !== null) {
    return `Использовано ${props.usage.used} из ${resolvedLimit.value}`
  }
  if (hasUsage.value) return `Использовано ${props.usage.used}`
  return `Лимит ${resolvedLimit.value} за период`
})

const remainingText = computed(() => {
  if (props.usage?.remaining === undefined || props.usage?.remaining === null) return ""
  return `Осталось ${props.usage.remaining}`
})
</script>

<style scoped>
.ai-usage {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: var(--color-text);
}

.ai-usage--empty {
  background: var(--color-warning-bg);
  border-color: var(--color-warning-border);
}

.ai-usage__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ai-usage__title {
  font-size: var(--font-xs);
  font-weight: 700;
  color: var(--color-text-secondary);
}

.ai-usage--empty .ai-usage__title {
  color: var(--color-warning);
}

.ai-usage__value,
.ai-usage__remaining {
  font-size: var(--font-sm);
  line-height: 1.35;
}

.ai-usage__value {
  color: var(--color-text);
  font-weight: 600;
}

.ai-usage__remaining {
  flex-shrink: 0;
  color: var(--color-text);
  font-weight: 600;
}

@media (max-width: 360px) {
  .ai-usage {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
