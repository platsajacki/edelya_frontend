<template>
  <div v-if="visible" class="ai-usage" :class="{ 'ai-usage--empty': isEmpty }">
    <div class="ai-usage__row">
      <span class="ai-usage__title">AI-запросы</span>
      <span class="ai-usage__value">{{ usageText }}</span>
    </div>
    <div v-if="progressPercent !== null" class="ai-usage__bar">
      <div class="ai-usage__bar-fill" :style="{ width: progressPercent + '%' }" />
    </div>
    <span v-if="remainingText" class="ai-usage__remaining">{{ remainingText }}</span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import type { DTOAIRecipeUsage } from "@/types/subscription"

const props = withDefaults(
  defineProps<{
    usage?: DTOAIRecipeUsage | null
    limit?: number | null
  }>(),
  { usage: null, limit: null }
)

const resolvedLimit = computed(() => props.usage?.limit ?? props.limit)
const hasUsage = computed(() => props.usage?.used !== undefined && props.usage?.used !== null)
const visible = computed(() => hasUsage.value || resolvedLimit.value !== null)
const isEmpty = computed(
  () => props.usage?.remaining !== undefined && Number(props.usage.remaining) <= 0
)

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

const progressPercent = computed(() => {
  if (!hasUsage.value || !resolvedLimit.value) return null
  const used = Number(props.usage.used)
  const limit = Number(resolvedLimit.value)
  return Math.min(100, Math.max(0, (used / limit) * 100))
})
</script>

<style lang="scss" scoped>
.ai-usage {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
  color: var(--color-text);

  &--empty {
    background: var(--color-warning-bg);
    border-color: var(--color-warning-border);

    .ai-usage__title {
      color: var(--color-warning);
    }
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &__title {
    font-size: var(--font-xs);
    font-weight: 700;
    color: var(--color-text-secondary);
  }

  &__value,
  &__remaining {
    font-size: var(--font-sm);
    line-height: 1.35;
  }

  &__value {
    color: var(--color-text);
    font-weight: 600;
  }

  &__remaining {
    color: var(--color-text-secondary);
  }

  &__bar {
    width: 100%;
    height: 4px;
    border-radius: var(--radius-pill);
    background: var(--color-border);
    overflow: hidden;
  }

  &__bar-fill {
    height: 100%;
    border-radius: var(--radius-pill);
    background: var(--color-mint);
    transition: width var(--transition-normal);
  }
}
</style>
