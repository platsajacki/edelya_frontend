import { api } from "../api/client"

export function createAIDraft(payload) {
  return api("/api/v1/ai-drafts/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function fetchAIDrafts(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = query ? `/api/v1/ai-drafts/?${query}` : "/api/v1/ai-drafts/"
  return api(url)
}

export function fetchAIDraft(id) {
  return api(`/api/v1/ai-drafts/${id}/`)
}

export function createDishFromAIDraft(id, payload) {
  return api(`/api/v1/ai-drafts/${id}/create-dish/`, {
    method: "POST",
    body: JSON.stringify({ payload }),
  })
}
