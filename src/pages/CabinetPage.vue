<template>
  <div class="page-layout cabinet">
    <!-- Header -->
    <header class="cabinet__header">
      <h1 class="cabinet__title">Личный кабинет</h1>
      <p v-if="userName" class="cabinet__user-name">{{ greeting }}, {{ userName }}!</p>
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

    <!-- Tariff change confirmation sheet -->
    <ConfirmTariffSheet
      v-if="confirmSheetScenario"
      :model-value="showConfirmSheet"
      :scenario="confirmSheetScenario"
      :loading="tariffLoading"
      @update:model-value="closeConfirmSheet"
      @confirm="onConfirmTariff"
    />

    <!-- Toast -->
    <Toast :message="toast" @dismiss="toast = null" />

    <!-- Payment method -->
    <section v-if="showPaymentMethod" class="cabinet__card cabinet__payment">
      <h2 class="cabinet__section-title cabinet__payment-title">Способ оплаты</h2>
      <template v-if="sub.paymentMethod">
        <p class="cabinet__payment-card">
          {{ sub.paymentMethod.title || `${sub.paymentMethod.card_type} •••• ${sub.paymentMethod.card_last4}` }}
        </p>
        <template v-if="!deleteCardConfirm">
          <p class="cabinet__payment-warning">⚠ Удаление карты отключит автопродление</p>
          <button
            class="cabinet__btn cabinet__btn--cancel"
            :disabled="paymentLoading"
            @click="deleteCardConfirm = true"
          >
            Удалить карту
          </button>
        </template>
        <div v-else class="cabinet__cancel-confirm">
          <p class="cabinet__cancel-text">Удалить привязанную карту?</p>
          <div class="cabinet__cancel-actions">
            <button class="cabinet__btn cabinet__btn--cancel-confirm" :disabled="paymentLoading" @click="handleDeletePaymentMethod">
              {{ paymentLoading ? "Загрузка..." : "Да, удалить" }}
            </button>
            <button class="cabinet__btn cabinet__btn--cancel-dismiss" :disabled="paymentLoading" @click="deleteCardConfirm = false">Нет</button>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="cabinet__payment-warning">
          ⚠ Карта не привязана. Для автоматического списания необходимо привязать карту.
        </p>
        <button
          class="cabinet__btn"
          :disabled="paymentLoading"
          @click="handleBindPaymentMethod"
        >
          {{ paymentLoading ? "Загрузка..." : "Привязать карту" }}
        </button>
      </template>
      <p v-if="paymentError" class="cabinet__error">{{ paymentError }}</p>
    </section>

    <!-- Tariffs -->
    <section v-if="showTariffs && sub.tariffs.length" class="cabinet__tariffs">
      <h2 class="cabinet__section-title">Тарифы</h2>
      <div
        v-for="tariff in sub.tariffs"
        :key="tariff.id"
        class="cabinet__tariff"
        :class="{ 'cabinet__tariff--current': isCurrent(tariff), 'cabinet__tariff--pending': isPending(tariff) }"
      >
        <div class="cabinet__tariff-header">
          <span class="cabinet__tariff-name">{{ tariff.name }}</span>
          <span v-if="tariff.soon" class="cabinet__tariff-badge">Скоро</span>
          <span v-if="isCurrent(tariff)" class="cabinet__tariff-badge cabinet__tariff-badge--current">Текущий</span>
          <span v-if="isPending(tariff)" class="cabinet__tariff-badge cabinet__tariff-badge--pending">Запланирован</span>
        </div>
        <p class="cabinet__tariff-price">{{ formatPrice(tariff) }}</p>
        <p v-if="tariff.description" class="cabinet__tariff-desc">{{ tariff.description }}</p>
        <ul class="cabinet__tariff-features">
          <li v-if="tariff.can_create_ai_recipes">AI рецепты</li>
          <li v-if="tariff.can_have_common_space">Общее пространство</li>
        </ul>
        <!-- Current tariff: subtle cancel with inline confirmation -->
        <template v-if="isCurrent(tariff)">
          <template v-if="sub.subscription?.cancelled_at">
            <p class="cabinet__cancel-pending">
              Подписка будет отменена по истечении текущего периода
            </p>
            <button
              class="cabinet__btn cabinet__btn--tariff"
              :disabled="resumeLoading"
              @click="resumeTariff"
            >
              {{ resumeLoading ? "Загрузка..." : "Возобновить подписку" }}
            </button>
          </template>
          <template v-else-if="sub.subscription?.status === 'expired'">
            <button
              class="cabinet__btn cabinet__btn--tariff"
              :disabled="resumeLoading"
              @click="resumeTariff"
            >
              {{ resumeLoading ? "Загрузка..." : "Возобновить подписку" }}
            </button>
          </template>
          <template v-else-if="cancelConfirmId !== tariff.id">
            <button class="cabinet__btn cabinet__btn--cancel" @click="cancelConfirmId = tariff.id">
              Отменить подписку
            </button>
          </template>
          <div v-else class="cabinet__cancel-confirm">
            <p class="cabinet__cancel-text">Вы уверены? Отменить подписку?</p>
            <div class="cabinet__cancel-actions">
              <button class="cabinet__btn cabinet__btn--cancel-confirm" :disabled="cancelLoading" @click="cancelTariff">
                {{ cancelLoading ? "Загрузка..." : "Да, отменить" }}
              </button>
              <button class="cabinet__btn cabinet__btn--cancel-dismiss" :disabled="cancelLoading" @click="cancelConfirmId = null">Нет</button>
            </div>
          </div>
        </template>
        <!-- Soon: no button, badge is enough -->
        <!-- Pending: already scheduled, show badge only -->
        <template v-else-if="!tariff.soon">
          <div v-if="isPending(tariff)" class="cabinet__tariff-pending-note">
            <p class="cabinet__tariff-pending-text">{{ pendingActivationText }}</p>
          </div>
          <!-- Selectable: primary CTA -->
          <button
            v-else
            class="cabinet__btn cabinet__btn--tariff"
            @click="selectTariff(tariff)"
          >
            {{ sub.hasSubscription && !sub.isTrialActive ? "Сменить тариф" : "Выбрать тариф" }}
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "../store/auth"
import { useSubscriptionStore } from "../store/subscription"
import { getTariffChangeScenario } from "../utils/tariffScenario"
import IconWarning from "../components/icons/IconWarning.vue"
import IconCheck from "../components/icons/IconCheck.vue"
import ConfirmTariffSheet from "../components/ConfirmTariffSheet.vue"
import Toast from "../components/Toast.vue"

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const sub = useSubscriptionStore()
const loading = ref(false)
const actionError = ref(null)
const cancelConfirmId = ref(null)
const paymentLoading = ref(false)
const paymentError = ref(null)
const deleteCardConfirm = ref(false)

const toast = ref(null)
let toastTimer = null

function showToast(message) {
  toast.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 3500)
}

const showConfirmSheet = ref(false)
const confirmSheetTariff = ref(null)
const tariffLoading = ref(false)

const confirmSheetScenario = computed(() => {
  if (!confirmSheetTariff.value || !sub.subscription) return null
  return getTariffChangeScenario(sub.subscription, confirmSheetTariff.value, sub.paymentMethod)
})

const userName = computed(() => auth.user?.first_name ?? null)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Доброе утро'
  if (h >= 12 && h < 18) return 'Добрый день'
  if (h >= 18 && h < 23) return 'Добрый вечер'
  return 'Доброй ночи'
})

onMounted(async () => {
  const isPaymentReturn = !!route.query.payment_return
  const promises = [sub.loadMySubscription(), sub.loadTariffs(), sub.loadPaymentMethod()]
  if (!sub.hasSubscription && sub.trialDays === null) {
    promises.push(sub.loadTrialDuration())
  }
  await Promise.allSettled(promises)

  // Returned from YooKassa redirect — refresh subscription and card, then clear query param
  if (isPaymentReturn) {
    await Promise.allSettled([sub.loadMySubscription(), sub.loadPaymentMethod()])
    router.replace({ query: {} })
    showToast("Подписка обновлена")
  }
})

onUnmounted(() => {
  clearTimeout(toastTimer)
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

function isPending(tariff) {
  return sub.subscription?.pending_tariff?.id === tariff.id
}

const pendingActivationText = computed(() => {
  const s = sub.subscription
  if (!s) return ""
  if (s.cancelled_at) return "Тариф не может быть подключён, пока подписка отменена. Возобновите подписку."
  if (s.status === "trial") return "Будет подключён после окончания пробного периода"
  return "Будет подключён с началом следующего расчётного периода"
})

const showTariffs = computed(() => {
  if (sub.errorCode === "subscription_required") return false
  return true
})

const showPaymentMethod = computed(() => {
  if (sub.paymentMethod) return true
  if (sub.subscription?.pending_tariff) return true
  const tariff = sub.subscription?.tariff
  return !!tariff && !tariff.is_trial_tariff
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
    if (s.cancelled_at) {
      return {
        icon: IconWarning,
        iconClass: "cabinet__card-icon--warning",
        title: "Пробный период отменён",
        description: "Автоматический переход на платный тариф отключён. Доступ сохраняется до конца пробного периода.",
        actionText: null,
      }
    }
    const pendingNote = s.pending_tariff
      ? ` Тариф «${s.pending_tariff.name}»: ${pendingActivationText.value.toLowerCase()}.`
      : ""
    return {
      icon: IconCheck,
      iconClass: "cabinet__card-icon--ok",
      title: "Пробный период",
      description: (sub.daysLeft !== null
        ? `Все функции сервиса доступны. Осталось ${sub.daysLeft} ${dayWord(sub.daysLeft)}.`
        : "Пробный период активен — все функции сервиса доступны") + pendingNote,
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
    if (s.cancelled_at) {
      return {
        icon: IconWarning,
        iconClass: "cabinet__card-icon--warning",
        title: `Тариф: ${s.tariff?.name}`,
        description: s.current_period_end
          ? `Подписка будет отменена ${formatDate(s.current_period_end)}. Отмена запрошена ${formatDateTime(s.cancelled_at)}.`
          : `Подписка будет отменена. Отмена запрошена ${formatDateTime(s.cancelled_at)}.`,
        actionText: null,
      }
    }
    const pendingNote = s.pending_tariff
      ? ` Тариф «${s.pending_tariff.name}» будет подключён с ${s.current_period_end ? formatDate(s.current_period_end) : "начала следующего периода"}.`
      : ""
    return {
      icon: IconCheck,
      iconClass: "cabinet__card-icon--ok",
      title: `Тариф: ${s.tariff?.name}`,
      description: (s.current_period_end
        ? `Активен до ${formatDate(s.current_period_end)}.`
        : "Подписка активна.") + pendingNote,
      actionText: null,
    }
  }

  if (s.status === "cancelled") {
    return {
      icon: IconWarning,
      iconClass: "cabinet__card-icon--warning",
      title: "Подписка отменена",
      description: s.cancelled_at
        ? `Подписка была отменена ${formatDateTime(s.cancelled_at)}.`
        : "Подписка отменена.",
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
    description: "Возможно, возникла проблема с оплатой. Проверьте платёжную информацию.",
    actionText: null,
  },
  expired: {
    icon: IconWarning,
    iconClass: "cabinet__card-icon--warning",
    title: "Подписка истекла",
    description: "Возможно, возникла проблема с оплатой. Проверьте платёжную информацию.",
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
    description: "Подписка отменена.",
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

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
  if (!sub.subscription) return
  const scenario = getTariffChangeScenario(sub.subscription, tariff)
  if (!scenario) return
  confirmSheetTariff.value = tariff
  showConfirmSheet.value = true
}

function closeConfirmSheet() {
  if (tariffLoading.value) return
  showConfirmSheet.value = false
  confirmSheetTariff.value = null
}

const CONFLICT_MESSAGES = {
  "You are already subscribed to this tariff": "Вы уже подписаны на этот тариф.",
  "You have a pending subscription to this tariff": "Этот тариф уже запланирован.",
  "Upgrade payment was canceled": "Платёж был отменён. Попробуйте ещё раз.",
  "Active payment method required to upgrade. Please update your payment info.": "Требуется активный способ оплаты. Обновите платёжные данные.",
}

async function onConfirmTariff() {
  if (!confirmSheetTariff.value) return
  tariffLoading.value = true
  try {
    const result = await sub.selectTariff(confirmSheetTariff.value.id)
    showConfirmSheet.value = false
    confirmSheetTariff.value = null
    if (result.action === "redirect") {
      window.location.href = result.confirmation_url
    } else {
      showToast(result.description ?? "Тариф изменён.")
    }
  } catch (err) {
    showConfirmSheet.value = false
    confirmSheetTariff.value = null
    const message = CONFLICT_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось сменить тариф."
    showToast(message)
  } finally {
    tariffLoading.value = false
  }
}

const cancelLoading = ref(false)
const resumeLoading = ref(false)

const CANCEL_ERROR_MESSAGES = {
  "Subscription is already cancelled.": "Подписка уже отменена.",
  "Subscription is already in the process of cancellation.": "Отмена уже в процессе.",
  "Subscription cannot be cancelled in current status.": "Подписку невозможно отменить в текущем статусе.",
}

async function cancelTariff() {
  cancelLoading.value = true
  try {
    await sub.cancelSubscription()
    cancelConfirmId.value = null
    showToast("Подписка отменена")
  } catch (err) {
    cancelConfirmId.value = null
    const message = CANCEL_ERROR_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось отменить подписку."
    showToast(message)
  } finally {
    cancelLoading.value = false
  }
}

const RESUME_ERROR_MESSAGES = {
  "Subscription is not pending cancellation.": "Подписка не находится в процессе отмены.",
  "Subscription cannot be resumed in current status.": "Подписку невозможно возобновить в текущем статусе.",
}

async function resumeTariff() {
  resumeLoading.value = true
  try {
    await sub.resumeSubscription()
    showToast("Подписка возобновлена")
  } catch (err) {
    const message = RESUME_ERROR_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось возобновить подписку."
    showToast(message)
  } finally {
    resumeLoading.value = false
  }
}

async function handleBindPaymentMethod() {
  paymentError.value = null
  paymentLoading.value = true
  try {
    const result = await sub.bindPaymentMethod()
    if (result.action === "redirect") {
      window.location.href = result.confirmation_url
    }
  } catch (err) {
    if (err.status === 409) {
      paymentError.value = "Карта уже привязана. Удалите текущую карту, чтобы привязать новую."
      await sub.loadPaymentMethod().catch(() => {})
    } else {
      paymentError.value = err.message ?? "Не удалось начать привязку карты."
    }
  } finally {
    paymentLoading.value = false
  }
}

async function handleDeletePaymentMethod() {
  paymentError.value = null
  paymentLoading.value = true
  try {
    await sub.deletePaymentMethod()
    await sub.loadMySubscription().catch(() => {})
    deleteCardConfirm.value = false
  } catch (err) {
    paymentError.value = err.message ?? "Не удалось удалить карту."
  } finally {
    paymentLoading.value = false
  }
}
</script>

<style scoped>
.cabinet {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 12px 16px var(--nav-height);
}

.cabinet__header {
  padding: 0;
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

.cabinet__cancel-pending {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  text-align: center;
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

/* Payment method section */
.cabinet__payment {
  align-items: stretch;
  text-align: left;
}

.cabinet__payment-title {
  margin-bottom: 4px;
}

.cabinet__payment-card {
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--color-text);
}

.cabinet__payment-warning {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Pending tariff state */
.cabinet__tariff--pending {
  border-color: var(--color-border);
}

.cabinet__tariff-badge--pending {
  background: var(--color-surface-muted);
  color: var(--color-text-secondary);
}

.cabinet__tariff-pending-note {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cabinet__tariff-pending-text {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  line-height: 1.4;
}
</style>
