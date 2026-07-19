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
        <div class="cabinet__card-header">
          <div class="cabinet__card-avatar">
            <component :is="subscriptionCard.icon" :width="30" :height="30" />
          </div>
          <div class="cabinet__card-header-text">
            <div class="cabinet__card-title-row">
              <h2 class="cabinet__card-heading">{{ subscriptionCard.title }}</h2>
              <span
                v-if="cardBadge"
                class="cabinet__card-status"
                :class="`cabinet__card-status--${cardBadge.tone}`"
              >
                <IconCheck v-if="cardBadge.tone === 'success'" :width="18" :height="18" />
                {{ cardBadge.text }}
              </span>
            </div>
            <p class="cabinet__card-text">{{ subscriptionCard.description }}</p>
          </div>
        </div>

        <AIRecipeUsageBadge
          v-if="sub.canCreateAIRecipes"
          class="cabinet__card-usage"
          :usage="sub.aiRecipeUsage"
          :limit="sub.aiRecipeLimit"
        />

        <p v-if="subscriptionCard.actionText" class="cabinet__recurring-notice">
          На время пробного периода все функции сервиса доступны бесплатно.<br />
          Далее от 99 руб./месяц.
        </p>
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
        <div class="cabinet__payment-info">
          <div class="cabinet__payment-brand">{{ cardBrandAbbr }}</div>
          <div class="cabinet__payment-details">
            <span class="cabinet__payment-card">
              {{
                sub.paymentMethod?.card_type && sub.paymentMethod?.card_last4
                  ? `${sub.paymentMethod.card_type} *${sub.paymentMethod.card_last4}`
                  : sub.paymentMethod?.title
              }}
            </span>
            <span class="cabinet__payment-status">
              {{
                sub.subscription?.auto_renew ? "Автопродление включено" : "Автопродление отключено"
              }}
            </span>
          </div>
        </div>
        <template v-if="!deleteCardConfirm">
          <button
            class="cabinet__btn cabinet__btn--cancel"
            :disabled="paymentLoading"
            @click="deleteCardConfirm = true"
          >
            Удалить карту
          </button>
          <p class="cabinet__payment-warning">
            <IconWarning class="cabinet__payment-warning-icon" :width="14" :height="14" />
            Удаление карты отключит автопродление
          </p>
        </template>
        <div v-else class="cabinet__cancel-confirm">
          <p class="cabinet__cancel-text">Удалить привязанную карту?</p>
          <div class="cabinet__cancel-actions">
            <button
              class="cabinet__btn cabinet__btn--cancel-confirm"
              :disabled="paymentLoading"
              @click="handleDeletePaymentMethod"
            >
              {{ paymentLoading ? "Загрузка..." : "Да, удалить" }}
            </button>
            <button
              class="cabinet__btn cabinet__btn--cancel-dismiss"
              :disabled="paymentLoading"
              @click="deleteCardConfirm = false"
            >
              Нет
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <p class="cabinet__payment-warning">
          <IconWarning class="cabinet__payment-warning-icon" :width="14" :height="14" />
          Карта не привязана. Для автоматического списания необходимо привязать карту.
        </p>
        <button class="cabinet__btn" :disabled="paymentLoading" @click="handleBindPaymentMethod">
          {{ paymentLoading ? "Загрузка..." : "Привязать карту" }}
        </button>
      </template>
      <p v-if="paymentError" class="cabinet__error">{{ paymentError }}</p>
    </section>

    <!-- Tariffs -->
    <section v-if="showTariffs && sub.tariffs.length" class="cabinet__tariffs">
      <div class="cabinet__tariffs-header">
        <h2 class="cabinet__section-title">Тарифы</h2>
        <span v-if="billingNote" class="cabinet__tariffs-note">{{ billingNote }}</span>
      </div>
      <div
        v-for="tariff in sub.tariffs"
        :key="tariff.id"
        class="cabinet__tariff"
        :class="{
          'cabinet__tariff--current': isCurrent(tariff),
          'cabinet__tariff--pending': isPending(tariff),
        }"
      >
        <div class="cabinet__tariff-top">
          <div class="cabinet__tariff-header">
            <span class="cabinet__tariff-name">{{ tariff.name }}</span>
            <span v-if="tariff.soon" class="cabinet__tariff-badge cabinet__tariff-badge--soon"
              >Скоро</span
            >
            <span
              v-if="isCurrent(tariff)"
              class="cabinet__tariff-badge cabinet__tariff-badge--current"
            >
              <IconCheck />
              Текущий</span
            >
            <span
              v-if="isPending(tariff)"
              class="cabinet__tariff-badge cabinet__tariff-badge--pending"
              >Запланирован</span
            >
          </div>
          <div class="cabinet__tariff-price">
            <span class="cabinet__tariff-price-value">{{ tariffPriceValue(tariff) }}</span>
            <span class="cabinet__tariff-price-period">{{ tariffPricePeriod(tariff) }}</span>
          </div>
        </div>
        <p v-if="tariff.description" class="cabinet__tariff-desc">{{ tariff.description }}</p>
        <ul v-if="tariff.description_items?.length" class="cabinet__tariff-description">
          <li v-for="item in tariff.description_items" :key="item">
            <IconCheck class="cabinet__tariff-check" :width="22" :height="22" />
            <span>{{ item }}</span>
          </li>
        </ul>
        <ul class="cabinet__tariff-features">
          <li v-if="tariff.can_create_ai_recipes">{{ aiRecipeFeatureText }}</li>
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
            <button class="cabinet__btn cabinet__btn--tariff" @click="selectTariff(tariff)">
              Возобновить подписку
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
              <button
                class="cabinet__btn cabinet__btn--cancel-confirm"
                :disabled="cancelLoading"
                @click="cancelTariff"
              >
                {{ cancelLoading ? "Загрузка..." : "Да, отменить" }}
              </button>
              <button
                class="cabinet__btn cabinet__btn--cancel-dismiss"
                :disabled="cancelLoading"
                @click="cancelConfirmId = null"
              >
                Нет
              </button>
            </div>
          </div>
        </template>
        <!-- Soon: no button, badge is enough -->
        <!-- Pending: already scheduled, show badge only -->
        <template v-else-if="!tariff.soon">
          <div v-if="isPending(tariff)" class="cabinet__tariff-pending-note">
            <p class="cabinet__tariff-pending-text">{{ pendingActivationText }}</p>
          </div>
          <!-- Selectable: primary CTA for upgrades, muted for downgrades/lateral -->
          <button
            v-else
            class="cabinet__btn cabinet__btn--tariff"
            :class="{ 'cabinet__btn--tariff-secondary': !isUpgradeTariff(tariff) }"
            @click="selectTariff(tariff)"
          >
            {{ sub.hasSubscription && !sub.isTrialActive ? "Сменить тариф" : "Выбрать тариф" }}
          </button>
        </template>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useAuthStore } from "../store/auth"
import { useSubscriptionStore } from "../store/subscription"
import { getTariffChangeScenario } from "../utils/tariffScenario"
import IconWarning from "../components/icons/IconWarning.vue"
import IconCheck from "../components/icons/IconCheck.vue"
import ConfirmTariffSheet from "../components/ConfirmTariffSheet.vue"
import Toast from "../components/Toast.vue"
import AIRecipeUsageBadge from "../components/AIRecipeUsageBadge.vue"
import IconCrown from "@/components/icons/IconCrown.vue"

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
  toastTimer = setTimeout(() => {
    toast.value = null
  }, 3500)
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
  if (h >= 5 && h < 12) return "Доброе утро"
  if (h >= 12 && h < 18) return "Добрый день"
  if (h >= 18 && h < 23) return "Добрый вечер"
  return "Доброй ночи"
})

onMounted(async () => {
  const isPaymentReturn = !!route.query.payment_return
  const promises = [
    sub.loadMySubscription(),
    sub.loadTariffs(),
    sub.loadPaymentMethod(),
    sub.loadSubscriptionDictionary(),
  ]
  if (!sub.hasSubscription && sub.trialDays === null) {
    promises.push(sub.loadTrialDuration())
  }
  await Promise.allSettled(promises)
  if (sub.canCreateAIRecipes) {
    await sub.loadAIRecipeUsage().catch(() => {})
  }

  // Returned from YooKassa redirect — refresh subscription and card, then clear query param
  if (isPaymentReturn) {
    await Promise.allSettled([sub.loadMySubscription(), sub.loadPaymentMethod()])
    if (sub.canCreateAIRecipes) {
      await sub.loadAIRecipeUsage().catch(() => {})
    }
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

const BILLING_PERIOD_NOTE = {
  monthly: "оплата ежемесячно",
  yearly: "оплата ежегодно",
}

function tariffPriceValue(tariff) {
  return `${Number(tariff.price)} ₽`
}

function tariffPricePeriod(tariff) {
  const period = BILLING_PERIOD_LABEL[tariff.billing_period] ?? tariff.billing_period
  return `в ${period}`
}

const billingNote = computed(() => {
  const periods = new Set(sub.tariffs.map((t) => t.billing_period))
  if (periods.size !== 1) return ""
  return BILLING_PERIOD_NOTE[[...periods][0]] ?? ""
})

const CARD_BRAND_LABEL = {
  mastercard: "MC",
  visa: "VISA",
  mir: "МИР",
}

const cardBrandAbbr = computed(() => {
  const type = sub.paymentMethod?.card_type
  if (!type) return "💳"
  return CARD_BRAND_LABEL[type.toLowerCase()] ?? type.slice(0, 2).toUpperCase()
})

const cardBadge = computed(() => {
  if (subscriptionCard.value?.iconClass === "cabinet__card-icon--ok") {
    return { text: "Активен", tone: "success" }
  }
  if (subscriptionCard.value?.iconClass === "cabinet__card-icon--warning") {
    return { text: "Внимание", tone: "warning" }
  }
  return null
})

function isCurrent(tariff) {
  return sub.subscription?.tariff?.id === tariff.id
}

function isUpgradeTariff(tariff) {
  const current = sub.subscription?.tariff
  if (!current) return true
  return Number(tariff.price) > Number(current.price)
}

function isPending(tariff) {
  return sub.subscription?.pending_tariff?.id === tariff.id
}

const pendingActivationText = computed(() => {
  const s = sub.subscription
  if (!s) return ""
  if (s.cancelled_at)
    return "Тариф не может быть подключён, пока подписка отменена. Возобновите подписку."
  if (s.status === "trial") return "Будет подключён после окончания пробного периода"
  return "Будет подключён с началом следующего расчётного периода"
})

const aiRecipeFeatureText = computed(() => {
  const limit = sub.aiRecipeLimit
  return limit === null ? "AI рецепты" : `${limit} AI-рецептов в месяц`
})

const showTariffs = computed(() => {
  return sub.errorCode !== "subscription_required"
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
          ? `У вас ещё нет подписки. Попробуйте бесплатно ${getWeekFromDays(days)}!`
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
        ? `У вас ещё нет подписки. Попробуйте бесплатно ${getWeekFromDays(days)}!`
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
        description:
          "Автоматический переход на платный тариф отключён. Доступ сохраняется до конца пробного периода.",
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
      description:
        (sub.daysLeft !== null
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
      icon: IconCrown,
      iconClass: "cabinet__card-icon--ok",
      title: `Тариф: ${s.tariff?.name}`,
      description:
        (s.current_period_end
          ? `Активен до ${formatDate(s.current_period_end)}`
          : "Подписка активна") + pendingNote,
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

function getWeekFromDays(days) {
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  if (weeks > 0 && remainingDays === 0) {
    return `${weeks} ${weekWord(weeks)}`
  }
  if (weeks > 0) {
    return `${weeks} ${weekWord(weeks)} и ${remainingDays} ${dayWord(remainingDays)}`
  }
  return `${days} ${dayWord(days)}`
}

function dayWord(n) {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs >= 11 && abs <= 19) return "дней"
  if (last === 1) return "день"
  if (last >= 2 && last <= 4) return "дня"
  return "дней"
}

function weekWord(n) {
  const abs = Math.abs(n) % 100
  const last = abs % 10
  if (abs >= 11 && abs <= 19) return "недель"
  if (last === 1) return "неделя"
  if (last >= 2 && last <= 4) return "недели"
  return "недель"
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

const TARIFF_RESULT_DESCRIPTIONS = {
  "Tariff change scheduled for the next billing cycle.": "Смена тарифа запланирована.",
  "Tariff downgrade scheduled for the next billing cycle.": "Понижение тарифа запланировано.",
  "Tariff upgraded successfully.": "Тариф успешно повышен.",
}

const CONFLICT_MESSAGES = {
  "You are already subscribed to this tariff": "Вы уже подписаны на этот тариф.",
  "You have a pending subscription to this tariff": "Этот тариф уже запланирован.",
  "Upgrade payment was canceled": "Платёж был отменён. Попробуйте ещё раз.",
  "Active payment method required to upgrade. Please update your payment info.":
    "Требуется активный способ оплаты. Обновите платёжные данные.",
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
      showToast(
        TARIFF_RESULT_DESCRIPTIONS[result.description] ?? result.description ?? "Тариф изменён."
      )
    }
  } catch (err) {
    showConfirmSheet.value = false
    confirmSheetTariff.value = null
    const message =
      CONFLICT_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось сменить тариф."
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
  "Subscription cannot be cancelled in current status.":
    "Подписку невозможно отменить в текущем статусе.",
}

async function cancelTariff() {
  cancelLoading.value = true
  try {
    await sub.cancelSubscription()
    cancelConfirmId.value = null
    showToast("Подписка отменена")
  } catch (err) {
    cancelConfirmId.value = null
    const message =
      CANCEL_ERROR_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось отменить подписку."
    showToast(message)
  } finally {
    cancelLoading.value = false
  }
}

const RESUME_ERROR_MESSAGES = {
  "Subscription is not pending cancellation.": "Подписка не находится в процессе отмены.",
  "Subscription cannot be resumed in current status.":
    "Подписку невозможно возобновить в текущем статусе.",
}

async function resumeTariff() {
  resumeLoading.value = true
  try {
    await sub.resumeSubscription()
    showToast("Подписка возобновлена")
  } catch (err) {
    const message =
      RESUME_ERROR_MESSAGES[err.body?.detail] ?? err.message ?? "Не удалось возобновить подписку."
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

<style lang="scss" scoped>
.cabinet {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: var(--page-padding-top) 16px 16px;

  &__header {
    padding: 0;
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 600;
  }

  &__user-name {
    margin-top: 4px;
    font-size: var(--font-base);
    color: var(--color-text-secondary);
  }

  /* Subscription card */
  &__card {
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
  }

  &__card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__card-avatar {
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

  &__card-header-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  &__card-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__card-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: var(--radius-pill);
    font-size: var(--font-xs);
    font-weight: 700;

    &--success {
      background: var(--color-success-bg);
      color: var(--color-success);
    }

    &--warning {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }
  }

  &__card-heading {
    font-size: var(--font-lg);
    font-weight: 600;
    color: var(--color-text);
  }

  &__card-text {
    font-size: var(--font-base);
    color: var(--color-text-secondary);
    line-height: 1.5;
  }

  &__card-usage {
    width: 100%;
    border: none;
  }

  /* Buttons */
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

    &--tariff {
      margin-top: 0;
    }

    &--tariff-secondary {
      color: var(--color-mint);
      background: var(--color-mint-alpha-06);
      border: 1.5px solid var(--color-mint-alpha-25);
      font-size: var(--font-sm);
      padding: 10px 24px;

      &:active {
        background: var(--color-mint-alpha-16);
      }
    }

    &--cancel {
      margin-top: 0;
      width: 100%;
      padding: 10px 24px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-pill);
      font-size: var(--font-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      background: transparent;
      transition:
        background var(--transition-fast),
        color var(--transition-fast);

      &:active {
        background: var(--color-border);
        color: var(--color-text);
      }
    }

    &--cancel-confirm {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-sm);
      font-weight: 600;
      color: var(--color-text-secondary);
      background: var(--color-surface-muted);
      transition: background var(--transition-fast);

      &:active {
        background: var(--color-border);
      }
    }

    &--cancel-dismiss {
      flex: 1;
      padding: 10px 16px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: var(--font-sm);
      font-weight: 700;
      color: var(--on-primary);
      background: var(--color-mint);
      transition: background var(--transition-fast);

      &:active {
        background: var(--color-mint-hover);
      }
    }
  }

  &__error {
    font-size: var(--font-sm);
    color: var(--color-error);
  }

  &__recurring-notice {
    margin: 0;
    font-size: var(--font-xs, 12px);
    color: var(--color-text-secondary);
    line-height: 1.5;
    text-align: center;
  }

  /* Tariffs section */
  &__section-title {
    font-size: var(--font-xs);
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  &__tariffs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__tariffs-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  &__tariffs-note {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__tariff {
    padding: 20px;
    background: var(--color-surface);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-card);
    border: 2px solid transparent;
    transition: border-color var(--transition-fast);

    &--current {
      border-color: var(--color-mint);
    }
    &--pending {
      border-color: var(--color-border);
    }
  }

  &__tariff-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 4px;
  }

  &__tariff-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__tariff-name {
    font-size: var(--font-md);
    font-weight: 600;
  }

  &__tariff-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: var(--font-xs);
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
    background: var(--color-surface-muted);
    color: var(--color-text-secondary);

    &--current {
      background: var(
        --color-mint-alpha-10,
        color-mix(in srgb, var(--color-mint) 10%, transparent)
      );
      color: var(--color-mint);
    }

    &--pending {
      background: var(--color-surface-muted);
      color: var(--color-text-secondary);
    }

    &--soon {
      background: var(--color-warning-bg);
      color: var(--color-warning);
    }
  }

  &__tariff-price {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
  }

  &__tariff-price-value {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text);
    white-space: nowrap;
  }

  &__tariff-price-period {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__tariff-desc {
    margin: 0 0 8px;
    color: var(--color-text-secondary);
    font-size: var(--font-sm);
    line-height: 1.4;
  }

  &__tariff-description {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0 0 10px;
    padding-left: 0;
    list-style: none;
    color: var(--color-text);
    font-size: var(--font-sm);
    line-height: 1.4;

    li {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  &__tariff-check {
    flex-shrink: 0;
    color: var(--color-mint);
  }

  &__tariff-features {
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    li {
      font-size: var(--font-xs);
      padding: 2px 10px;
      background: var(
        --color-mint-alpha-10,
        color-mix(in srgb, var(--color-mint) 10%, transparent)
      );
      color: var(--color-mint);
      border-radius: var(--radius-pill);
      font-weight: 600;
    }
  }

  &__tariff-pending-note {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__tariff-pending-text {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  /* Payment method section */
  &__payment {
    align-items: stretch;
    text-align: left;
    gap: 12px;
    background: var(--color-surface);
    border-color: var(--color-border);
  }

  &__payment-title {
    margin-bottom: 0;
  }

  &__payment-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--color-empty);
    border-radius: var(--radius-sm);
  }

  &__payment-brand {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    background: var(--color-text);
    color: var(--color-surface);
    font-size: var(--font-xs);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  &__payment-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__payment-card {
    font-size: var(--font-md);
    font-weight: 600;
    color: var(--color-text);
  }

  &__payment-status {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__payment-warning {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    line-height: 1.4;
  }

  &__payment-warning-icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--color-warning-icon);
  }

  &__cancel-pending {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    text-align: center;
  }

  &__cancel-confirm {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__cancel-text {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    text-align: center;
  }

  &__cancel-actions {
    display: flex;
    gap: 8px;
  }
}
</style>
