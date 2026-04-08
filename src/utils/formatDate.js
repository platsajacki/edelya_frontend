export function formatYMDtoDDMMYYYY(ymd) {
  if (!ymd) return ''
  const [y, m, d] = String(ymd).split('-')
  if (!y || !m || !d) return ymd
  return `${d.padStart(2,'0')}.${m.padStart(2,'0')}.${y}`
}

const SHORT_MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

/** Formats YYYY-MM-DD → "8 апр" */
export function formatDateRuShort(ymd) {
  if (!ymd) return ''
  const [, m, d] = String(ymd).split('-')
  if (!m || !d) return ymd
  return `${parseInt(d, 10)} ${SHORT_MONTHS_RU[parseInt(m, 10) - 1]}`
}