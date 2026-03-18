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

const ERROR_MESSAGES = {
  "At least one ingredient is required.": "Нужен хотя бы один ингредиент.",
  "Duplicate ingredients are not allowed.": "Ингредиенты не должны повторяться.",
  "Dish with this name already exists.": "Блюдо с таким названием уже существует.",
  "Dish must have at least one ingredient": "У блюда должен быть хотя бы один ингредиент.",
  "An ingredient with this name already exists for this user.": "Ингредиент с таким названием уже существует.",
  "Date when eating starts cannot be earlier than cooking date": "Дата начала еды не может быть раньше даты готовки.",
  "All eat dates must be on or after the cooking date.": "Все дни еды должны быть не раньше дня готовки.",
  "All eat_dates must be on or after cooking_date.": "Все дни еды должны быть не раньше дня готовки.",
  "Invalid Telegram data": "Неверные данные Telegram.",
  "User must be authenticated to get week dishes.": "Необходимо войти в аккаунт.",
  "No active account found with the given credentials.": "Неверный логин или пароль.",
  "Authentication credentials were not provided.": "Необходимо войти в аккаунт.",
  "You do not have permission to perform this action.": "У вас нет прав для этого действия.",
  "Not found.": "Не найдено.",
  "Token is invalid or expired.": "Сессия истекла, войдите снова.",
}

const FIELD_NAMES = {
  name: "Название",
  category: "Категория",
  description: "Описание",
  dish: "Блюдо",
  dish_ingredients: "Ингредиенты",
  ingredient: "Ингредиент",
  amount: "Количество",
  base_unit: "Единица измерения",
  cooking_date: "Дата готовки",
  eat_dates: "Дни еды",
  date: "Дата",
  position: "Позиция",
  notes: "Комментарий",
}

function translateMessage(msg) {
  if (ERROR_MESSAGES[msg]) return ERROR_MESSAGES[msg]

  // "Not valid year 2025 and week 99." — dynamic
  if (/^Not valid year \d+ and week \d+/.test(msg)) return "Неверный год или номер недели."
  // "Ingredients not found: 1, 2" — dynamic
  if (/^Ingredients not found:/.test(msg)) return "Некоторые ингредиенты не найдены."
  // "Maximum N ingredients are allowed."
  if (/^Maximum \d+ ingredients are allowed/.test(msg)) {
    const n = msg.match(/\d+/)?.[0]
    return `Максимум ${n} ингредиентов.`
  }
  // DRF standard validators
  if (/^Ensure this value is less than or equal to/.test(msg)) {
    const n = msg.match(/\d+/)?.[0]
    return `Значение не должно превышать ${n}.`
  }
  if (/^Ensure this value is greater than or equal to/.test(msg)) {
    const n = msg.match(/\d+/)?.[0]
    return `Значение должно быть не менее ${n}.`
  }
  if (/must make a unique set/.test(msg)) return "Такая запись уже существует."
  if (/^This field is required/.test(msg)) return "Обязательное поле."
  if (/^This field may not be blank/.test(msg)) return "Поле не может быть пустым."
  if (/^This field may not be null/.test(msg)) return "Поле не может быть пустым."

  console.warn("Untranslated API message:", msg)
  return "Произошла ошибка. Попробуйте ещё раз."
}

async function parseError(response) {
  const body = await response.json().catch(() => null)

  const err = new Error()
  err.status = response.status
  err.body = body

  if (!body) {
    err.message = "Ошибка сервера. Попробуйте позже."
    return err
  }

  if (typeof body === "string") {
    err.message = translateMessage(body)
    return err
  }

  // {"detail": "..."} — 401, 403, 404, some 400s
  if (body.detail) {
    err.message = translateMessage(body.detail)
    return err
  }

  // ["error message", ...] — ValidationError raised with a list
  if (Array.isArray(body)) {
    err.message = body.map((m) => translateMessage(String(m))).join("; ")
    return err
  }

  // {"non_field_errors": [...], "field": [...], ...} — DRF validation
  const parts = []
  for (const [key, value] of Object.entries(body)) {
    const messages = Array.isArray(value) ? value : [value]
    const translated = messages.map((m) => translateMessage(String(m)))

    if (key === "non_field_errors") {
      parts.push(translated.join("; "))
    } else {
      const label = FIELD_NAMES[key]
      parts.push(label ? `${label}: ${translated.join("; ")}` : translated.join("; "))
    }
  }

  err.message = parts.length ? parts.join("\n") : "Ошибка сервера. Попробуйте позже."
  return err
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

  if (response.status === 204) return null

  return response.json()
}
