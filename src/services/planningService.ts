import { api } from "../api/client"
import type {
  DTOWeekDishes,
  DTOMealPlanItem,
  DTOCookingEvent,
  CreateMealPlanItemPayload,
  UpdateMealPlanItemPayload,
} from "@/types/planning"

export function fetchWeek(year: number, week: number): Promise<DTOWeekDishes> {
  return api<DTOWeekDishes>(`/api/v1/planning/year/${year}/week/${week}/`)
}

export function fetchCookingEvent(id: string): Promise<DTOCookingEvent> {
  return api<DTOCookingEvent>(`/api/v1/planning/cooking-events/${id}/`)
}

export function createCookingEvent(payload: Partial<DTOCookingEvent>): Promise<DTOCookingEvent> {
  return api<DTOCookingEvent>(`/api/v1/planning/cooking-events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function createMealPlanItem(payload: CreateMealPlanItemPayload): Promise<DTOMealPlanItem> {
  return api<DTOMealPlanItem>(`/api/v1/planning/meal-plan-items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateCookingEvent(
  id: string,
  payload: Partial<DTOCookingEvent>
): Promise<DTOCookingEvent> {
  return api<DTOCookingEvent>(`/api/v1/planning/cooking-events/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteCookingEvent(id: string): Promise<null> {
  return api<null>(`/api/v1/planning/cooking-events/${id}/`, {
    method: "DELETE",
  })
}

export function updateMealPlanItem(
  id: string,
  payload: UpdateMealPlanItemPayload
): Promise<DTOMealPlanItem> {
  return api<DTOMealPlanItem>(`/api/v1/planning/meal-plan-items/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteMealPlanItem(id: string): Promise<null> {
  return api<null>(`/api/v1/planning/meal-plan-items/${id}/`, {
    method: "DELETE",
  })
}

export function batchUpdateMealPositions(
  items: { id: string; date: string; position: number }[]
): Promise<DTOMealPlanItem[]> {
  return Promise.all(
    items.map((item) => updateMealPlanItem(item.id, { date: item.date, position: item.position }))
  )
}
