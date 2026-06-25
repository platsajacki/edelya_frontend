import { api } from "../api/client"
import type { DTOPaginatedResponse } from "@/types/common"
import type { DTOIngredient, DTOIngredientCategory } from "@/types/shopping"

export function fetchIngredients(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const url = query ? `/api/v1/ingredients/?${query}` : `/api/v1/ingredients/`
  return api<DTOPaginatedResponse<DTOIngredient>>(url)
}

export function fetchIngredientById(id: string) {
  return api<DTOIngredient>(`/api/v1/ingredients/${id}/`)
}

export function createIngredient(payload: Record<string, unknown>) {
  return api<DTOIngredient>(`/api/v1/ingredients/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function fetchIngredientCategories() {
  return api<DTOPaginatedResponse<DTOIngredientCategory>>(`/api/v1/ingredient-categories/`)
}
