import { api } from "../api/client"
import type { DTOAIDraft, DTODish } from "@/types/dish"
import type { DTOPaginatedResponse } from "@/types/common"

export function createAIDraft(payload: Partial<DTOAIDraft>): Promise<DTOAIDraft> {
  return api<DTOAIDraft>("/api/v1/ai-drafts/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function fetchAIDrafts(
  params: Record<string, unknown> = {}
): Promise<DTOPaginatedResponse<DTOAIDraft>> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const url = query ? `/api/v1/ai-drafts/?${query}` : "/api/v1/ai-drafts/"
  return api<DTOPaginatedResponse<DTOAIDraft>>(url)
}

export function fetchAIDraft(id: string): Promise<DTOAIDraft> {
  return api<DTOAIDraft>(`/api/v1/ai-drafts/${id}/`)
}

export function createDishFromAIDraft(
  id: string,
  payload: Record<string, unknown>
): Promise<DTODish> {
  return api<DTODish>(`/api/v1/ai-drafts/${id}/create-dish/`, {
    method: "POST",
    body: JSON.stringify({ payload }),
  })
}
