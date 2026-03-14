import { api } from "../api/client"

export function fetchWeek(year, week) {
  return api(`/api/v1/planning/year/${year}/week/${week}/`)
}

export function createCookingEvent(payload) {
  return api(`/api/v1/planning/cooking-events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function createMealPlanItem(payload) {
  return api(`/api/v1/planning/meal-plan-items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}
