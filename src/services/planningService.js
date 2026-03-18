import { api } from "../api/client"

export function fetchWeek(year, week) {
  return api(`/api/v1/planning/year/${year}/week/${week}/`)
}

export function fetchCookingEvent(id) {
  return api(`/api/v1/planning/cooking-events/${id}/`)
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

export function updateCookingEvent(id, payload) {
  return api(`/api/v1/planning/cooking-events/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteCookingEvent(id) {
  return api(`/api/v1/planning/cooking-events/${id}/`, {
    method: "DELETE",
  })
}

export function updateMealPlanItem(id, payload) {
  return api(`/api/v1/planning/meal-plan-items/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteMealPlanItem(id) {
  return api(`/api/v1/planning/meal-plan-items/${id}/`, {
    method: "DELETE",
  })
}

export function batchUpdateMealPositions(items) {
  return Promise.all(
    items.map((item) =>
      updateMealPlanItem(item.id, { date: item.date, position: item.position })
    )
  )
}
