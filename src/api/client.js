import { getAccess, getRefresh, getAccessExp, saveTokens } from "../storage/tokenStorage"

const API = import.meta.env.VITE_API

const EXPIRY_BUFFER_SEC = 10

function isAccessExpired() {
  const exp = getAccessExp()
  return exp === null || Date.now() / 1000 >= exp - EXPIRY_BUFFER_SEC
}

let refreshing = null

async function refreshTokens() {
  const refresh = getRefresh()
  if (!refresh) throw new Error("No refresh token")

  const response = await fetch(API + "/api/v1/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh })
  })

  if (!response.ok) {
    window.dispatchEvent(new CustomEvent("auth:expired"))
    throw new Error("Token refresh failed")
  }

  const tokens = await response.json()
  saveTokens(tokens)
  return tokens
}

function buildHeaders(extra = {}, hasBody = false) {
  const headers = { ...extra }
  if (hasBody) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }
  const token = getAccess()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function parseError(response) {
  const body = await response.json().catch(() => null)
  return new Error(body?.detail ?? `HTTP ${response.status}`)
}

export async function api(url, options = {}) {
  if (getRefresh() && isAccessExpired()) {
    if (!refreshing) {
      refreshing = refreshTokens().finally(() => { refreshing = null })
    }
    await refreshing
  }

  const headers = buildHeaders(options.headers, Boolean(options.body))

  let response = await fetch(API + url, { ...options, headers })

  if (response.status === 401 && getRefresh()) {
    if (!refreshing) {
      refreshing = refreshTokens().finally(() => { refreshing = null })
    }
    await refreshing  // throws if refresh failed — caller handles it
    headers.Authorization = `Bearer ${getAccess()}`
    response = await fetch(API + url, { ...options, headers })
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}
