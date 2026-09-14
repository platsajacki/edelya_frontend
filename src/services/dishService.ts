import { api } from "../api/client"
import type { DTODish, DTODishCategory } from "@/types/dish"
import type { DTOPaginatedResponse } from "@/types/common"

export function fetchDishes(
  params: Record<string, unknown> = {}
): Promise<DTOPaginatedResponse<DTODish>> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const url = query ? `/api/v1/dishes/?${query}` : `/api/v1/dishes/`
  return api<DTOPaginatedResponse<DTODish>>(url)
}

export function fetchDish(id: string): Promise<DTODish> {
  return api<DTODish>(`/api/v1/dishes/${id}/`)
}

export function createDish(payload: Partial<DTODish>): Promise<DTODish> {
  return api<DTODish>(`/api/v1/dishes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateDish(id: string, payload: Partial<DTODish>): Promise<DTODish> {
  return api<DTODish>(`/api/v1/dishes/${id}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteDish(id: string): Promise<null> {
  return api<null>(`/api/v1/dishes/${id}/`, { method: "DELETE" })
}

export function fetchDishCategories(): Promise<DTOPaginatedResponse<DTODishCategory>> {
  return api<DTOPaginatedResponse<DTODishCategory>>(`/api/v1/dish-categories/`)
}
