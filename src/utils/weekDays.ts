/**
 * Pure utility functions for week-day calculations.
 * No component or store dependencies.
 */

export interface WeekDay {
  rawDate: string
  label: string
}

const DAY_LABELS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]

export { DAY_LABELS }

/** Today as YYYY-MM-DD in local timezone */
export function getTodayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

/** Check if today falls within the week starting at `startWeek` (YYYY-MM-DD, Monday) */
export function isCurrentWeek(startWeek: string): boolean {
  const today = getTodayISO()
  const start = new Date(startWeek + "T00:00:00")
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endISO = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
  return today >= startWeek && today <= endISO
}

/**
 * Split a days array into past and current+future.
 * Only splits when the week is the current week; otherwise all days go to visible.
 */
export function splitDays<T extends WeekDay>(
  days: T[],
  startWeek: string
): { pastDays: T[]; visibleDays: T[] } {
  if (!isCurrentWeek(startWeek)) {
    return { pastDays: [], visibleDays: days }
  }
  const today = getTodayISO()
  const pastDays = days.filter((d) => d.rawDate < today)
  const visibleDays = days.filter((d) => d.rawDate >= today)
  return { pastDays, visibleDays }
}

/**
 * Build a human-readable label for the collapsed past days toggle.
 * e.g. "ПН – СР · 3 дня"
 */
export function pastDaysLabel(pastDays: WeekDay[]): string {
  if (!pastDays.length) return ""
  const first = pastDays[0].label
  const last = pastDays[pastDays.length - 1].label
  const count = pastDays.length
  const dayWord = count === 1 ? "день" : count < 5 ? "дня" : "дней"
  if (count === 1) return `${first} · 1 ${dayWord}`
  return `${first} – ${last} · ${count} ${dayWord}`
}

/**
 * Compute next week's year and ISO week number from a given week start date.
 * @param startWeek - current week's Monday as YYYY-MM-DD
 */
export function getNextWeekInfo(startWeek: string): { year: number; week: number } {
  const monday = new Date(startWeek + "T00:00:00")
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  const d = new Date(
    Date.UTC(nextMonday.getFullYear(), nextMonday.getMonth(), nextMonday.getDate())
  )
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

/**
 * Format a week's date range as human-readable label.
 * e.g. "13 апреля – 19 апреля"
 */
export function formatWeekRange(startWeek: string): string {
  const start = new Date(startWeek + "T00:00:00")
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  return `${fmt(start)} – ${fmt(end)}`
}
