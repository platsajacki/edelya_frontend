import { api } from "../api/client"

export function fetchDishes(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/api/v1/dishes/?${query}` : `/api/v1/dishes/`
  return api(url)
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
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function fetchDishCategories() {
  return api(`/api/v1/dish-categories/`)
}
