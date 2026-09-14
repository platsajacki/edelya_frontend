import { api } from "../api/client"
import type { DTOShoppingList, DTOShoppingListItem } from "@/types/shopping"
import type { DTOPaginatedResponse } from "@/types/common"

const BASE = "/api/v1/shopping/shopping-lists"

export function fetchShoppingLists(
  params: Record<string, unknown> = {}
): Promise<DTOPaginatedResponse<DTOShoppingList>> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const url = query ? `${BASE}/?${query}` : `${BASE}/`
  return api<DTOPaginatedResponse<DTOShoppingList>>(url)
}

export function fetchShoppingList(id: string): Promise<DTOShoppingList> {
  return api<DTOShoppingList>(`${BASE}/${id}/`)
}

export function createShoppingList(payload: Partial<DTOShoppingList>): Promise<DTOShoppingList> {
  return api<DTOShoppingList>(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateShoppingList(
  id: string,
  payload: Partial<DTOShoppingList>
): Promise<DTOShoppingList> {
  return api<DTOShoppingList>(`${BASE}/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteShoppingList(id: string): Promise<null> {
  return api<null>(`${BASE}/${id}/`, { method: "DELETE" })
}

export function recalculateShoppingList(id: string): Promise<{ detail: string }> {
  return api<{ detail: string }>(`${BASE}/${id}/recalculate/`, { method: "POST" })
}

export function fetchShoppingListItems(
  listId: string,
  params: Record<string, unknown> = {}
): Promise<DTOPaginatedResponse<DTOShoppingListItem>> {
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const url = query ? `${BASE}/${listId}/items/?${query}` : `${BASE}/${listId}/items/`
  return api<DTOPaginatedResponse<DTOShoppingListItem>>(url)
}

export function createShoppingListItem(
  listId: string,
  payload: Partial<DTOShoppingListItem>
): Promise<DTOShoppingListItem> {
  return api<DTOShoppingListItem>(`${BASE}/${listId}/items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateShoppingListItem(
  listId: string,
  itemId: string,
  payload: Partial<DTOShoppingListItem>
): Promise<DTOShoppingListItem> {
  return api<DTOShoppingListItem>(`${BASE}/${listId}/items/${itemId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteShoppingListItem(listId: string, itemId: string): Promise<null> {
  return api<null>(`${BASE}/${listId}/items/${itemId}/`, { method: "DELETE" })
}
