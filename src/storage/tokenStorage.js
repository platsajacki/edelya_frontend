function decodeJwtExp(token) {
  try {
    const payload = token.split(".")[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    return decoded.exp ?? null
  } catch {
    return null
  }
}

export function saveTokens(tokens) {
  if (!tokens?.access || !tokens?.refresh) {
    throw new Error("Invalid token response from server")
  }
  localStorage.setItem("access", tokens.access)
  localStorage.setItem("refresh", tokens.refresh)

  const accessExp = decodeJwtExp(tokens.access)
  const refreshExp = decodeJwtExp(tokens.refresh)
  if (accessExp !== null) localStorage.setItem("access_exp", accessExp)
  if (refreshExp !== null) localStorage.setItem("refresh_exp", refreshExp)
}

export function getAccess() {
  return localStorage.getItem("access")
}

export function getRefresh() {
  return localStorage.getItem("refresh")
}

export function getAccessExp() {
  const exp = localStorage.getItem("access_exp")
  return exp !== null ? Number(exp) : null
}

export function getRefreshExp() {
  const exp = localStorage.getItem("refresh_exp")
  return exp !== null ? Number(exp) : null
}

export function clearTokens() {
  localStorage.removeItem("access")
  localStorage.removeItem("refresh")
  localStorage.removeItem("access_exp")
  localStorage.removeItem("refresh_exp")
}
