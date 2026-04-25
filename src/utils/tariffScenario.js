import { calcProration } from "./calcProration"

const BILLING_PERIOD_LABEL = {
  monthly: "мес",
  yearly: "год",
}

function formatPrice(tariff) {
  const period = BILLING_PERIOD_LABEL[tariff.billing_period] ?? tariff.billing_period
  return `${Number(tariff.price)} ₽/${period}`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Determines the tariff-change scenario and returns all UI text needed
 * to show the confirmation sheet.
 *
 * Scenarios:
 *   card_binding — trial, no payment method → redirect to YooKassa card binding
 *   schedule     — trial, has payment method → schedule tariff for next period
 *   payment      — expired/cancelled → redirect to full payment
 *   downgrade    — active, cheaper tariff → schedule for next period
 *   upgrade      — active, more expensive → immediate charge + activation
 *
 * @param {object} subscription - current subscription from the store
 * @param {object} newTariff    - the tariff the user wants to switch to
 * @returns {{ type, title, description, confirmLabel, proration: number|null }}
 */
export function getTariffChangeScenario(subscription, newTariff) {
  const { status, tariff: currentTariff, payment_method, current_period_end } = subscription
  const hasCard = payment_method?.is_active === true

  if (status === "trial") {
    if (!hasCard) {
      return {
        type: "card_binding",
        title: "Привязка карты",
        description:
          `Для выбора тарифа «${newTariff.name}» нужно привязать банковскую карту. ` +
          `Тариф будет активирован автоматически после успешной привязки. ` +
          `Оплата сейчас не производится.`,
        confirmLabel: "Привязать карту",
        proration: null,
      }
    }
    return {
      type: "schedule",
      title: "Подтвердите выбор тарифа",
      description:
        `Тариф «${newTariff.name}» будет активирован с начала следующего расчётного периода. ` +
        `Стоимость: ${formatPrice(newTariff)}. ` +
        `Сейчас деньги не списываются.`,
      confirmLabel: "Подтвердить",
      proration: null,
    }
  }

  if (status === "expired" || status === "cancelled") {
    return {
      type: "payment",
      title: "Оплата и активация",
      description:
        `Для активации тарифа «${newTariff.name}» необходимо оплатить ${formatPrice(newTariff)}. ` +
        `Вы будете перенаправлены на страницу оплаты.`,
      confirmLabel: "Перейти к оплате",
      proration: null,
    }
  }

  if (status === "active") {
    const isUpgrade = Number(newTariff.price) > Number(currentTariff.price)

    if (!isUpgrade) {
      const periodEnd = current_period_end ? formatDate(current_period_end) : "начала следующего периода"
      return {
        type: "downgrade",
        title: "Смена тарифа",
        description:
            `Тариф «${newTariff.name}» (${formatPrice(newTariff)}) будет активирован с ${periodEnd}. ` +
            `До этого момента действует тариф «${currentTariff.name}». ` +
          `Возврат средств за оставшиеся дни не производится.`,
        confirmLabel: "Запланировать смену",
        proration: null,
      }
    }

    const proration = calcProration(subscription, newTariff)
    const proratedText = proration > 0
      ? `С вашей карты спишется пропорциональная сумма за оставшиеся дни текущего периода: ${proration} ₽.`
      : `Пропорциональное списание не требуется.`
    return {
      type: "upgrade",
      title: "Повышение тарифа",
      description:
        `Тариф «${newTariff.name}» будет активирован немедленно. ` +
        `${proratedText} ` +
        `Новый расчётный период начнётся сегодня.`,
      confirmLabel: "Оплатить и активировать",
      proration,
    }
  }

  return null
}
