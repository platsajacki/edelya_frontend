export function formatYMDtoDDMMYYYY(ymd) {
  if (!ymd) return ''
  const [y, m, d] = String(ymd).split('-')
  if (!y || !m || !d) return ymd
  return `${d.padStart(2,'0')}.${m.padStart(2,'0')}.${y}`
}