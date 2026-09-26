import type { DTOCookingEvent, DTOMealPlanItem, DTOWeekDishes } from "@/types/planning"

const DAY_MS = 86_400_000
const WEEK_DAYS = 7

export class WeekCalendar {
  constructor(
    private readonly current: DTOWeekDishes,
    private readonly next: DTOWeekDishes
  ) {}
  weekFor(year: number, week: number): DTOWeekDishes {
    const diff = this.daysFromCurrent(year, week)
    if (diff === WEEK_DAYS) return this.next
    return this.shiftWeek(this.current, diff)
  }
  findCookingEvent(id: string): DTOCookingEvent {
    const events = [...this.current.cooking_events, ...this.next.cooking_events]
    return events.find((event) => event.id === id) ?? events[0]
  }
  private daysFromCurrent(year: number, week: number): number {
    const jan4 = new Date(year, 0, 4)
    const monday = new Date(year, 0, 4 - ((jan4.getDay() + 6) % 7) + (week - 1) * WEEK_DAYS)
    const currentMonday = new Date(this.current.start_week + "T00:00:00")
    return Math.round((monday.getTime() - currentMonday.getTime()) / DAY_MS)
  }
  private shiftWeek(week: DTOWeekDishes, days: number): DTOWeekDishes {
    return {
      start_week: this.shiftDate(week.start_week, days),
      end_week: this.shiftDate(week.end_week, days),
      meal_plan_items: week.meal_plan_items.map((item) => this.shiftMeal(item, days)),
      cooking_events: week.cooking_events.map((event) => this.shiftCooking(event, days)),
    }
  }
  private shiftMeal<T extends Pick<DTOMealPlanItem, "date">>(item: T, days: number): T {
    return { ...item, date: this.shiftDate(item.date, days) }
  }
  private shiftCooking(event: DTOCookingEvent, days: number): DTOCookingEvent {
    return {
      ...event,
      cooking_date: this.shiftDate(event.cooking_date, days),
      meal_plan_items: event.meal_plan_items.map((item) => this.shiftMeal(item, days)),
    }
  }
  private shiftDate(iso: string, days: number): string {
    const date = new Date(iso + "T00:00:00")
    date.setDate(date.getDate() + days)
    return date.toLocaleDateString("sv-SE")
  }
}
