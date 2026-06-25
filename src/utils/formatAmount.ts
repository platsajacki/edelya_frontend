export function formatAmount(value: string | number): string {
  const num = parseFloat(String(value))
  if (isNaN(num)) return String(value)
  return num.toString()
}
