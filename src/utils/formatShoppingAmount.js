import { getUnitLabel } from "./unitSteps"

const CONVERSION_RULES = [
  { from: "gram",       to: "кг", threshold: 1000, divisor: 1000 },
  { from: "milliliter",  to: "л",  threshold: 1000, divisor: 1000 },
  { from: "milligram",   to: "г",  threshold: 1000, divisor: 1000 },
]

function stripTrailingZeros(num) {
  const s = Number(num).toString()
  if (s.includes(".")) return s.replace(/\.?0+$/, "")
  return s
}

/**
 * Format an amount with its unit for display in shopping lists.
 * Handles automatic conversion (e.g. 1500g → 1.5 кг).
 *
 * @param {number|string} amount - raw amount in base unit
 * @param {string} baseUnit - unit key from BaseUnitEnum
 * @returns {{ display: string, number: string, unit: string }}
 */
export function formatShoppingAmount(amount, baseUnit) {
  const num = parseFloat(amount)

  if (baseUnit === "to_taste" || isNaN(num)) {
    return { display: "по вкусу", number: "", unit: "" }
  }

  for (const rule of CONVERSION_RULES) {
    if (baseUnit === rule.from && num >= rule.threshold) {
      const converted = num / rule.divisor
      const formatted = stripTrailingZeros(converted)
      return { display: `${formatted} ${rule.to}`, number: formatted, unit: rule.to }
    }
  }

  const formatted = stripTrailingZeros(num)
  const label = getUnitLabel(baseUnit)
  return { display: `${formatted} ${label}`, number: formatted, unit: label }
}
