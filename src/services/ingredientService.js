import { api } from "../api/client"

export function fetchIngredients(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/api/v1/ingredients/?${query}` : `/api/v1/ingredients/`
  return api(url)
}

export function createIngredient(payload) {
  return api(`/api/v1/ingredients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function fetchIngredientCategories() {
  return api(`/api/v1/ingredient-categories/`)
}
