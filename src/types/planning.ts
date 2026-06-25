import type { DTODish } from "@/types/dish.ts"

export interface DTOLightMealPlanItem {
  id: string
  dish: string
  date: string
  cooking_event?: string | null
  position?: number
  is_manual?: boolean
  color?: string
  created_at: string
  updated_at: string
}

export interface DTOMealPlanItem {
  id: string
  dish: DTODish
  owner: string
  date: string
  cooking_event?: string | null
  position?: number
  is_manual?: boolean
  color?: string
  created_at: string
  updated_at: string
}

export interface DTOCookingEvent {
  id: string
  dish: DTODish
  cooking_date: string
  notes?: string
  color?: string
  meal_plan_items: DTOLightMealPlanItem[]
  eat_dates?: string[]
  created_at: string
  updated_at: string
}

export interface CreateMealPlanItemPayload {
  dish: string
  date?: string
  eat_dates?: string[]
  position?: number
}

export interface UpdateMealPlanItemPayload {
  dish?: string
  date?: string
  position?: number
}

export interface DTOWeekDishes {
  start_week: string
  end_week: string
  meal_plan_items: DTOMealPlanItem[]
  cooking_events: DTOCookingEvent[]
}
