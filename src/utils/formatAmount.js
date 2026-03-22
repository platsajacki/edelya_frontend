export function formatAmount(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toString()
}
