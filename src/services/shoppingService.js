import { api } from "../api/client"

const BASE = "/api/v1/shopping/shopping-lists"

export function fetchShoppingLists(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query ? `${BASE}/?${query}` : `${BASE}/`
  return api(url)
}

export function fetchShoppingList(id) {
  return api(`${BASE}/${id}/`)
}

export function createShoppingList(payload) {
  return api(`${BASE}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateShoppingList(id, payload) {
  return api(`${BASE}/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteShoppingList(id) {
  return api(`${BASE}/${id}/`, { method: "DELETE" })
}

export function recalculateShoppingList(id) {
  return api(`${BASE}/${id}/recalculate/`, { method: "POST" })
}

export function fetchShoppingListItems(listId, params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query
    ? `${BASE}/${listId}/items/?${query}`
    : `${BASE}/${listId}/items/`
  return api(url)
}

export function createShoppingListItem(listId, payload) {
  return api(`${BASE}/${listId}/items/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function updateShoppingListItem(listId, itemId, payload) {
  return api(`${BASE}/${listId}/items/${itemId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function deleteShoppingListItem(listId, itemId) {
  return api(`${BASE}/${listId}/items/${itemId}/`, { method: "DELETE" })
}
