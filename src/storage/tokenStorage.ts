function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return decoded.exp ?? null
  } catch {
    return null
  }
}

export function saveTokens(tokens: { access: string; refresh: string }) {
  if (!tokens?.access || !tokens?.refresh) {
    throw new Error("Invalid token response from server")
  }
  sessionStorage.setItem("access", tokens.access)
  localStorage.setItem("refresh", tokens.refresh)

  const accessExp = decodeJwtExp(tokens.access)
  const refreshExp = decodeJwtExp(tokens.refresh)
  if (accessExp !== null) sessionStorage.setItem("access_exp", String(accessExp))
  if (refreshExp !== null) localStorage.setItem("refresh_exp", String(refreshExp))
}

export function getAccess() {
  return sessionStorage.getItem("access")
}

export function getRefresh() {
  return localStorage.getItem("refresh")
}

export function getAccessExp() {
  const exp = sessionStorage.getItem("access_exp")
  return exp !== null ? Number(exp) : null
}

export function getRefreshExp() {
  const exp = localStorage.getItem("refresh_exp")
  return exp !== null ? Number(exp) : null
}

export function clearTokens() {
  sessionStorage.removeItem("access")
  sessionStorage.removeItem("access_exp")
  localStorage.removeItem("refresh")
  localStorage.removeItem("refresh_exp")
}
