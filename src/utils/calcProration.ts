interface ProratedSubscription {
  current_period_start?: string | null
  current_period_end?: string | null
  tariff: { price: string | number }
}

interface ProratedTariff {
  price: string | number
}

/**
 * Calculates the prorated upgrade charge, mirroring the backend's _calc_proration logic
 * in tariff_selector.py (TariffSwitcher).
 *
 * Python timedelta.days returns integer floor-division, so we use Math.floor here.
 * Final result is rounded to 2 decimal places (same as Decimal.quantize('0.01')).
 * A positive charge is at least 1 ruble.
 *
 * @param {object} subscription - current subscription object from the store
 * @param {object} newTariff    - the tariff the user wants to switch to
 * @returns {number} prorated amount in rubles, ≥ 0
 */
export function calcProration(
  subscription: ProratedSubscription,
  newTariff: ProratedTariff
): number {
  const { current_period_start, current_period_end, tariff: currentTariff } = subscription
  if (!current_period_start || !current_period_end) return 0

  const now = Date.now()
  const end = new Date(current_period_end).getTime()
  const start = new Date(current_period_start).getTime()

  const remainingDays = Math.floor((end - now) / 86_400_000)
  if (remainingDays <= 0) return 0

  const totalDays = Math.max(1, Math.floor((end - start) / 86_400_000))

  const newPrice = Number(newTariff.price)
  const currentPrice = Number(currentTariff.price)

  const proration = (remainingDays / totalDays) * (newPrice - currentPrice)
  const amount = Math.round(proration * 100) / 100
  return proration > 0 && amount < 1 ? 1 : amount
}
