import { api } from "../api/client"
import { saveTokens } from "../storage/tokenStorage"

export async function login(username, password) {
  const tokens = await api("/api/v1/auth/token/login/", {
    method: "POST",
    body: JSON.stringify({ username, password })
  })
  saveTokens(tokens)
  return tokens
}

export async function telegramLogin(initData) {
  const tokens = await api("/api/v1/auth/token/telegram/", {
    method: "POST",
    headers: { "X-TG-INIT-DATA": initData }
  })
  saveTokens(tokens)
  return tokens
}
