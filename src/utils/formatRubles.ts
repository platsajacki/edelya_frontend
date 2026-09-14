export function formatRubles(amount: number | string): string {
  const value = Number(amount)
  const fractionDigits = Number.isInteger(value) ? 0 : 2

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
