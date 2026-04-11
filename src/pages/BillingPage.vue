<template>
  <div class="page-layout billing-page">
    <header class="billing-page__header">
      <h1 class="billing-page__title">Подписка</h1>
    </header>

    <div v-if="config" class="billing-page__card">
      <IconWarning class="billing-page__icon" :width="48" :height="48" />
      <h2 class="billing-page__heading">{{ config.title }}</h2>
      <p class="billing-page__description">{{ config.description }}</p>
      <button class="billing-page__action" @click="handleAction">
        {{ config.actionText }}
      </button>
    </div>

    <div v-else class="billing-page__card">
      <p class="billing-page__description">Нет данных о подписке.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useSubscriptionStore } from "../store/subscription"
import IconWarning from "../components/icons/IconWarning.vue"

const subscription = useSubscriptionStore()

const BILLING_CONFIG = {
  subscription_required: {
    title: "Начните бесплатный период",
    description: "У вас ещё нет подписки. Попробуйте бесплатно!",
    actionText: "Начать бесплатно",
  },
  trial_expired: {
    title: "Пробный период закончился",
    description: "Выберите тариф, чтобы продолжить пользоваться сервисом.",
    actionText: "Выбрать тариф",
  },
  subscription_cancelled: {
    title: "Подписка отменена",
    description: "Вы можете возобновить подписку в любой момент.",
    actionText: "Возобновить",
  },
  subscription_past_due: {
    title: "Проблема с оплатой",
    description: "Не удалось списать средства. Проверьте платёжные данные.",
    actionText: "Обновить карту",
  },
  subscription_expired: {
    title: "Подписка истекла",
    description: "Продлите подписку, чтобы продолжить пользоваться сервисом.",
    actionText: "Продлить",
  },
  subscription_inactive: {
    title: "Подписка неактивна",
    description: "Обратитесь в поддержку для решения проблемы.",
    actionText: "Связаться с поддержкой",
  },
}

const config = computed(() => BILLING_CONFIG[subscription.errorCode] ?? null)

function handleAction() {
  // TODO: integrate real billing actions per errorCode
  console.log("Billing action:", subscription.errorCode)
}
</script>

<style scoped>
.billing-page__header {
  padding: 16px 0 8px;
}

.billing-page__title {
  font-size: var(--font-lg);
  font-weight: 600;
}

.billing-page__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 32px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.billing-page__icon {
  color: var(--color-warning-icon);
}

.billing-page__heading {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
}

.billing-page__description {
  font-size: var(--font-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.billing-page__action {
  margin-top: 8px;
  width: 100%;
  padding: 14px 24px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--on-primary);
  background: var(--color-mint);
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.billing-page__action:active {
  background: var(--color-mint-hover);
  transform: scale(var(--press-scale-md));
}

.billing-page__action--secondary {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.billing-page__action--secondary:active {
  background: var(--color-border);
}
</style>
