<template>
  <div class="page-layout cabinet">
    <!-- Header -->
    <header class="cabinet__header">
      <h1 class="cabinet__title">Личный кабинет</h1>
      <p v-if="userName" class="cabinet__user-name">{{ userName }}</p>
    </header>

    <!-- Subscription card -->
    <section class="cabinet__card">
      <template v-if="subscriptionCard">
        <component
          :is="subscriptionCard.icon"
          class="cabinet__card-icon"
          :class="subscriptionCard.iconClass"
          :width="40"
          :height="40"
        />
        <h2 class="cabinet__card-heading">{{ subscriptionCard.title }}</h2>
        <p class="cabinet__card-text">{{ subscriptionCard.description }}</p>
        <button
          v-if="subscriptionCard.actionText"
          class="cabinet__btn"
          :disabled="loading"
          @click="handleAction"
        >
          {{ loading ? "Загрузка..." : subscriptionCard.actionText }}
        </button>
        <p v-if="actionError" class="cabinet__error">{{ actionError }}</p>
      </template>
      <template v-else>
        <p class="cabinet__card-text">Загрузка...</p>
      </template>
    </section>

    <!-- Tariffs -->
    <section v-if="showTariffs && sub.tariffs.length" class="cabinet__tariffs">
      <h2 class="cabinet__section-title">Тарифы</h2>
      <div
        v-for="tariff in sub.tariffs"
        :key="tariff.id"
        class="cabinet__tariff"
        :class="{ 'cabinet__tariff--current': isCurrent(tariff) }"
      >
        <div class="cabinet__tariff-header">
          <span class="cabinet__tariff-name">{{ tariff.name }}</span>
          <span v-if="tariff.soon" class="cabinet__tariff-badge">Скоро</span>
          <span v-if="isCurrent(tariff)" class="cabinet__tariff-badge cabinet__tariff-badge--current">Текущий</span>
        </div>
        <p class="cabinet__tariff-price">{{ formatPrice(tariff) }}</p>
        <p v-if="tariff.description" class="cabinet__tariff-desc">{{ tariff.description }}</p>
        <ul class="cabinet__tariff-features">
          <li v-if="tariff.can_create_ai_recipes">AI рецепты</li>
          <li v-if="tariff.can_have_common_space">Общее пространство</li>
        </ul>
        <!-- Current tariff: subtle cancel with inline confirmation -->
        <template v-if="isCurrent(tariff)">
          <template v-if="cancelConfirmId !== tariff.id">
            <button class="cabinet__btn cabinet__btn--cancel" @click="cancelConfirmId = tariff.id">
              Отменить подписку
            </button>
          </template>
          <div v-else class="cabinet__cancel-confirm">
            <p class="cabinet__cancel-text">Вы уверены? Отменить подписку?</p>
            <div class="cabinet__cancel-actions">
              <button class="cabinet__btn cabinet__btn--cancel-confirm" @click="cancelTariff(tariff)">Да, отменить</button>
              <button class="cabinet__btn cabinet__btn--cancel-dismiss" @click="cancelConfirmId = null">Нет</button>
            </div>
          </div>
        </template>
        <!-- Soon: no button, badge is enough -->
        <!-- Selectable: primary CTA -->
        <button
          v-else-if="!tariff.soon"
          class="cabinet__btn cabinet__btn--tariff"
          @click="selectTariff(tariff)"
        >
          {{ sub.hasSubscription && !sub.isTrialActive ? "Сменить тариф" : "Выбрать тариф" }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "../store/auth"
import { useSubscriptionStore } from "../store/subscription"
import IconWarning from "../components/icons/IconWarning.vue"
import IconCheck from "../components/icons/IconCheck.vue"

const router = useRouter()
const auth = useAuthStore()
const sub = useSubscriptionStore()
const loading = ref(false)
const actionError = ref(null)
const cancelConfirmId = ref(null)

const userName = computed(() => auth.user?.first_name ?? null)

onMounted(async () => {
  const promises = []
  if (!sub.hasSubscription && sub.trialDays === null) {
    promises.push(sub.loadTrialDuration())
  }
  promises.push(sub.loadTariffs())
  await Promise.allSettled(promises)
})

const BILLING_PERIOD_LABEL = {
  monthly: "мес",
  yearly: "год",
}

function formatPrice(tariff) {
  const period = BILLING_PERIOD_LABEL[tariff.billing_period] ?? tariff.billing_period
  return `${Number(tariff.price)} ₽/${period}`
}

function isCurrent(tariff) {
  return sub.subscription?.tariff?.id === tariff.id
}

const showTariffs = computed(() => {
  if (sub.errorCode === "subscription_required") return false
  return true
})

// Subscription card config based on state
const subscriptionCard = computed(() => {
  // 402 redirect states
  if (sub.errorCode) {
    if (sub.errorCode === "subscription_required") {
      const days = sub.trialDays
      return {
        icon: IconWarning,
        iconClass: "cabinet__card-icon--warning",
        title: "Начните бесплатный период",
        description: days
          ? `У вас ещё нет подписки. Попробуйте бесплатно ${days} дней!`
          : "У вас ещё нет подписки. Попробуйте бесплатно!",
        actionText: "Начать бесплатно",
      }
    }
    return ERROR_CARDS[sub.errorCode] ?? null
  }

  // Direct visit states
  if (!sub.hasSubscription) {
    const days = sub.trialDays
    return {
      icon: IconWarning,
      iconClass: "cabinet__card-icon--warning",
      title: "Начните бесплатный период",
      description: days
        ? `У вас ещё нет подписки. Попробуйте бесплатно ${days} дней!`
        : "У вас ещё нет подписки. Попробуйте бесплатно!",
      actionText: "Начать бесплатно",
    }
  }

  const s = sub.subscription
  if (s.status === "trial" && s.is_active && s.tariff?.is_trial_tariff) {
    return {
      icon: IconCheck,
      iconClass: "cabinet__card-icon--ok",
      title: "Пробный период",
      description: sub.daysLeft !== null
        ? `Осталось ${sub.daysLeft} ${dayWord(sub.daysLeft)}`
        : "Пробный период активен — все функции сервиса доступны",
      actionText: null,
    }
  }

  if (s.status === "trial" && !s.is_active) {
    return {
      icon: IconWarning,
      iconClass: "cabinet__card-icon--warning",
      title: "Пробный период закончился",
      description: "Выберите тариф, чтобы продолжить.",
      actionText: null,
    }
  }

  if (s.status === "active" && s.is_active) {
    return {
      icon: IconCheck,
      iconClass: "cabinet__card-icon--ok",
      title: `Тариф: ${s.tariff?.name}`,
      description: s.current_period_end
        ? `Активен до ${formatDate(s.current_period_end)}`
        : "Подписка активна",
      actionText: null,
    }
  }

  return ERROR_CARDS[s.status] ?? null
})

const ERROR_CARDS = {
  trial_expired: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Пробный период закончился",
    description: "Выберите тариф, чтобы продолжить пользоваться сервисом.",
    actionText: null,
  },
  subscription_cancelled: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка отменена",
    description: "Вы можете возобновить подписку в любой момент.",
    actionText: null,
  },
  subscription_past_due: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Проблема с оплатой",
    description: "Не удалось списать средства. Проверьте платёжные данные.",
    actionText: null,
  },
  past_due: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Проблема с оплатой",
    description: "Не удалось списать средства. Проверьте платёжные данные.",
    actionText: null,
  },
  subscription_expired: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка истекла",
    description: "Продлите подписку, чтобы продолжить пользоваться сервисом.",
    actionText: null,
  },
  expired: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка истекла",
    description: "Продлите подписку, чтобы продолжить пользоваться сервисом.",
    actionText: null,
  },
  subscription_inactive: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка неактивна",
    description: "Обратитесь в поддержку для решения проблемы.",
    actionText: null,
  },
  cancelled: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка отменена",
    description: "Вы можете возобновить подписку в любой момент.",
    actionText: null,
  },
}

function dayWord(n) {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs >= 11 && abs <= 19) return "дней"
  if (last === 1) return "день"
  if (last >= 2 && last <= 4) return "дня"
  return "дней"
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

async function handleAction() {
  actionError.value = null
  loading.value = true
  try {
    await sub.startTrial()
    sub.clear()
    router.push("/")
  } catch (err) {
    actionError.value = err.message ?? "Не удалось запустить триал."
  } finally {
    loading.value = false
  }
}

function selectTariff(tariff) {
  console.log("Select tariff:", tariff.id, tariff.name)
}

function cancelTariff(tariff) {
  // TODO: integrate cancellation endpoint when available
  console.log("Cancel tariff:", tariff.id, tariff.name)
  cancelConfirmId.value = null
}
</script>

<style scoped>
.cabinet {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cabinet__header {
  padding: 16px 0 0;
}

.cabinet__title {
  font-size: var(--font-lg);
  font-weight: 600;
}

.cabinet__user-name {
  margin-top: 4px;
  font-size: var(--font-base);
  color: var(--color-text-secondary);
}

/* Subscription card */
.cabinet__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 28px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.cabinet__card-icon--warning {
  color: var(--color-warning-icon);
}

.cabinet__card-icon--ok {
  color: var(--color-mint);
}

.cabinet__card-heading {
  font-size: var(--font-lg);
  font-weight: 600;
  color: var(--color-text);
}

.cabinet__card-text {
  font-size: var(--font-base);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Buttons */
.cabinet__btn {
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

.cabinet__btn:active {
  background: var(--color-mint-hover);
  transform: scale(var(--press-scale-md));
}

.cabinet__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cabinet__error {
  font-size: var(--font-sm);
  color: var(--color-error);
}

/* Tariffs section */
.cabinet__section-title {
  font-size: var(--font-lg);
  font-weight: 600;
}

.cabinet__tariffs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cabinet__tariff {
  padding: 20px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
}

.cabinet__tariff--current {
  border-color: var(--color-mint);
}

.cabinet__tariff-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.cabinet__tariff-name {
  font-size: var(--font-md);
  font-weight: 600;
}

.cabinet__tariff-badge {
  font-size: var(--font-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-xs, 4px);
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.cabinet__tariff-badge--current {
  background: var(--color-mint-alpha-10, color-mix(in srgb, var(--color-mint) 10%, transparent));
  color: var(--color-mint);
}

.cabinet__tariff-price {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 4px 0 8px;
}

.cabinet__tariff-desc {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  line-height: 1.4;
}

.cabinet__tariff-features {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cabinet__tariff-features li {
  font-size: var(--font-xs);
  padding: 2px 10px;
  background: var(--color-mint-alpha-10, color-mix(in srgb, var(--color-mint) 10%, transparent));
  color: var(--color-mint);
  border-radius: var(--radius-xs, 4px);
  font-weight: 600;
}

.cabinet__btn--tariff {
  margin-top: 0;
}

.cabinet__btn--cancel {
  margin-top: 0;
  width: 100%;
  padding: 10px 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.cabinet__btn--cancel:active {
  background: var(--color-border);
  color: var(--color-text);
}

.cabinet__cancel-confirm {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cabinet__cancel-text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  text-align: center;
}

.cabinet__cancel-actions {
  display: flex;
  gap: 8px;
}

.cabinet__btn--cancel-confirm {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  background: var(--color-surface-muted);
  transition: background var(--transition-fast);
}

.cabinet__btn--cancel-confirm:active {
  background: var(--color-border);
}

.cabinet__btn--cancel-dismiss {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 700;
  color: var(--on-primary);
  background: var(--color-mint);
  transition: background var(--transition-fast);
}

.cabinet__btn--cancel-dismiss:active {
  background: var(--color-mint-hover);
}
</style>
