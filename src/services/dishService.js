import { api } from "../api/client"

export function fetchDishes(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/api/v1/dishes/?${query}` : `/api/v1/dishes/`
  return api(url)
}

export function fetchDish(id) {
  return api(`/api/v1/dishes/${id}/`)
}

export function createDish(payload) {
  return api(`/api/v1/dishes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateDish(id, payload) {
  return api(`/api/v1/dishes/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteDish(id) {
  return api(`/api/v1/dishes/${id}/`, { method: "DELETE" })
}

export function fetchDishCategories() {
  return api(`/api/v1/dish-categories/`)
}
