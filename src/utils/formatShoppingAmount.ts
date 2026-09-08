import { getUnitLabel } from "./unitSteps"

const CONVERSION_RULES = [
  { from: "gram", to: "кг", threshold: 1000, divisor: 1000 },
  { from: "milliliter", to: "л", threshold: 1000, divisor: 1000 },
  { from: "milligram", to: "г", threshold: 1000, divisor: 1000 },
]

function stripTrailingZeros(num: number): string {
  const s = num.toString()
  if (s.includes(".")) return s.replace(/\.?0+$/, "")
  return s
}

export function formatShoppingAmount(
  amount: number | string,
  baseUnit: string
): { display: string; number: string; unit: string } {
  const num = parseFloat(String(amount))

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
