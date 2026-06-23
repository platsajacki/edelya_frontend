import { api } from "../api/client"
import { saveTokens } from "../storage/tokenStorage"

const API = window.__APP_CONFIG__?.apiUrl ?? import.meta.env.VITE_API

export async function login(username, password) {
  const tokens = await api("/api/v1/auth/token/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  })
  saveTokens(tokens)
  return tokens
}

/**
 * Initial Telegram auth — no body, no auth header needed.
 * Returns { ok: true, tokens } on 200,
 *         { ok: false, consents: string[] } on 428 (new user needs consent).
 * Throws on 401 or other errors.
 */
export async function telegramLogin(initData) {
  const response = await fetch(API + "/api/v1/auth/token/telegram/", {
    method: "POST",
    headers: { "X-TG-INIT-DATA": initData },
  })

  if (response.ok) {
    const tokens = await response.json()
    return { ok: true, tokens }
  }

  if (response.status === 428) {
    const body = await response.json()
    return { ok: false, consents: body.consents ?? [] }
  }

  if (response.status === 401) {
    throw new Error("Неверные данные Telegram. Попробуйте обновить приложение или войти заново.")
  }

  throw new Error("Ошибка авторизации. Попробуйте позже.")
}

/**
 * Re-sends POST /token/telegram/ with consent fields after user accepts terms.
 * Returns tokens on 200. Throws on 428 (unexpected) or 401.
 */
export async function telegramLoginWithConsent(initData, terms, marketing) {
  const response = await fetch(API + "/api/v1/auth/token/telegram/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-TG-INIT-DATA": initData,
    },
    body: JSON.stringify({
      terms_of_service_and_privacy_policy: terms,
      marketing_communications: marketing,
    }),
  })

  if (response.ok) {
    return await response.json()
  }

  if (response.status === 428) {
    throw new Error("Не удалось принять условия. Попробуйте снова.")
  }

  if (response.status === 401) {
    throw new Error("Неверные данные Telegram. Попробуйте обновить приложение или войти заново.")
  }

  throw new Error("Ошибка авторизации. Попробуйте позже.")
}
