<template>
  <section class="subscription-card">
    <template v-if="card">
      <div class="subscription-card__header">
        <div class="subscription-card__avatar">
          <component :is="card.icon" :width="30" :height="30" />
        </div>
        <div class="subscription-card__header-text">
          <div class="subscription-card__title-row">
            <h2 class="subscription-card__heading">{{ card.title }}</h2>
            <span
              v-if="badge"
              class="subscription-card__status"
              :class="`subscription-card__status--${badge.tone}`"
            >
              <IconCheck v-if="badge.tone === 'success'" :width="18" :height="18" />
              {{ badge.text }}
            </span>
          </div>
          <p class="subscription-card__text">{{ card.description }}</p>
        </div>
      </div>
      <slot />
      <button
        v-if="card.actionText"
        class="subscription-card__btn"
        :disabled="loading"
        @click="emit('action')"
      >
        {{ loading ? (card.actionLoadingText ?? "Загрузка…") : card.actionText }}
      </button>
      <p v-if="error" class="subscription-card__error" role="alert">{{ error }}</p>
    </template>
    <p v-else class="subscription-card__text">Загрузка…</p>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import IconCheck from "./icons/IconCheck.vue"
import type { SubscriptionCardConfig } from "@/utils/subscriptionCard"

const props = withDefaults(
  defineProps<{
    card: SubscriptionCardConfig | null
    loading?: boolean
    error?: string | null
  }>(),
  { loading: false, error: null }
)

const emit = defineEmits<{ action: [] }>()

const BADGES: Record<string, { text: string; tone: string }> = {
  "cabinet__card-icon--ok": { text: "Активен", tone: "success" },
  "cabinet__card-icon--warning": { text: "Внимание", tone: "warning" },
}

const badge = computed(() => (props.card ? (BADGES[props.card.iconClass] ?? null) : null))
</script>

<style lang="scss" scoped>
.subscription-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  background: linear-gradient(
    135deg,
    var(--color-mint-alpha-16) 0%,
    var(--color-mint-alpha-06) 100%
  );
  border: 1px solid var(--color-mint-alpha-25);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);

  &__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__avatar {
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    background: var(--color-mint);
    color: var(--on-primary);
  }

  &__header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-size: var(--font-xs);
    font-weight: 700;

    &--success {
      background: var(--color-success-bg);
      color: var(--color-success-dark);
    }

    &--warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }
  }

  &__heading {
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--color-text);
  }

  &__text {
    font-size: var(--font-base);
    color: var(--color-text-secondary);
    line-height: 1.5;
    white-space: pre-line;
  }

  &__btn {
    margin-top: 8px;
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: var(--radius-pill);
    font-size: var(--font-md);
    font-weight: 600;
    color: var(--on-primary);
    background: var(--color-mint);
    transition:
      background var(--transition-fast),
      transform var(--transition-fast);

    &:active {
      background: var(--color-mint-hover);
      transform: scale(var(--press-scale-md));
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    font-size: var(--font-sm);
    color: var(--color-danger-dark);
  }
}
</style>
