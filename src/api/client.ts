import { getAccess, getRefresh, getAccessExp, saveTokens } from "../storage/tokenStorage"

const API = window.__APP_CONFIG__?.apiUrl ?? import.meta.env.VITE_API

const EXPIRY_BUFFER_SEC = 10

function isAccessExpired() {
  const exp = getAccessExp()
  return exp === null || Date.now() / 1000 >= exp - EXPIRY_BUFFER_SEC
}

let refreshing: Promise<unknown> | null = null

async function refreshTokens() {
  const refresh = getRefresh()
  if (!refresh) throw new Error("No refresh token")

  const response = await fetch(API + "/api/v1/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })

  if (!response.ok) {
    window.dispatchEvent(new CustomEvent("auth:expired"))
    throw new Error("Token refresh failed")
  }

  const tokens = await response.json()
  saveTokens(tokens)
  return tokens
}

function buildHeaders(extra: Record<string, string> = {}, hasBody = false): Record<string, string> {
  const headers: Record<string, string> = { ...extra }
  if (hasBody) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json"
  }
  const token = getAccess()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const ERROR_MESSAGES: Record<string, string> = {
  "At least one ingredient is required.": "Нужен хотя бы один ингредиент.",
  "Duplicate ingredients are not allowed.": "Ингредиенты не должны повторяться.",
  "Dish with this name already exists.": "Личный рецепт с таким названием уже существует.",
  "Dish must have at least one ingredient": "У рецепта должен быть хотя бы один ингредиент.",
  "An ingredient with this name already exists for this user.":
    "Ингредиент с таким названием уже существует.",
  "Date when eating starts cannot be earlier than cooking date":
    "Дата начала еды не может быть раньше даты готовки.",
  "All eat dates must be on or after the cooking date.":
    "Все дни еды должны быть не раньше дня готовки.",
  "All eat_dates must be on or after cooking_date.":
    "Все дни еды должны быть не раньше дня готовки.",
  "All eat_dates must be greater than or equal to the current date of the meal plan item.":
    "Все дни еды должны быть не раньше текущей даты для этого приёма пищи.",
  "Date must be on or after the cooking date of the associated cooking event.":
    "Дата должна быть не раньше даты готовки.",
  "Invalid Telegram data": "Неверные данные Telegram.",
  "User must be authenticated to get week dishes.": "Необходимо войти в аккаунт.",
  "No active account found with the given credentials.": "Неверный логин или пароль.",
  "Authentication credentials were not provided.": "Необходимо войти в аккаунт.",
  "You do not have permission to perform this action.": "У вас нет прав для этого действия.",
  "Not found.": "Не найдено.",
  "Token is invalid or expired.": "Сессия истекла, войдите снова.",
  "date_from must be before or equal to date_to.":
    "Дата начала должна быть раньше или равна дате окончания.",
  "This ingredient is already in the shopping list.": "Этот ингредиент уже в списке покупок.",
  "User already has a subscription.": "У вас уже есть подписка.",
  "User must be authenticated.": "Необходимо войти в аккаунт.",
  "User must be authenticated to select a tariff": "Необходимо войти в аккаунт.",
  "No subscription found.": "Подписка не найдена.",
  "Tariff not found": "Тариф не найден.",
  "User subscription not found": "Подписка не найдена.",
  "Payment method already exists. Delete the existing one before adding a new one.":
    "Способ оплаты уже привязан. Удалите текущий, чтобы добавить новый.",
  "You are already subscribed to this tariff": "Вы уже подписаны на этот тариф.",
  "You have a pending subscription to this tariff": "Этот тариф уже запланирован.",
  "Upgrade payment was canceled": "Платёж был отменён. Попробуйте ещё раз.",
  "Active payment method required to upgrade. Please update your payment info.":
    "Требуется активный способ оплаты. Обновите платёжные данные.",
  "Subscription is already cancelled.": "Подписка уже отменена.",
  "Subscription is already in the process of cancellation.": "Отмена уже в процессе.",
  "Subscription cannot be cancelled in current status.":
    "Подписку невозможно отменить в текущем статусе.",
  "Subscription is not pending cancellation.": "Подписка не находится в процессе отмены.",
  "Subscription cannot be resumed in current status.":
    "Подписку невозможно возобновить в текущем статусе.",
  "AI recipe limit for the current subscription period has been exceeded.":
    "Лимит AI-рецептов на текущий период исчерпан.",
  "AI draft must be parsed before dish creation.": "AI-рецепт ещё не готов к созданию блюда.",
  "Payload must contain name, recipe, category and ingredients.":
    "Проверьте название, рецепт, категорию и ингредиенты.",
  "Ingredients must be a non-empty list.": "Нужен хотя бы один ингредиент.",
  "Payload must be a dictionary.": "Некорректный формат AI-рецепта.",
  "New ingredient must not contain ingredient id.": "Некорректный новый ингредиент.",
  "Existing ingredient id is required.": "Выберите существующий ингредиент.",
  "At least one ingredient must be required.": "Хотя бы один ингредиент должен быть обязательным.",
  prompt_injection:
    "Обнаружены подозрительные данные, похожие на попытку обойти систему. Пожалуйста, измените формулировку и попробуйте снова.",
  not_processable:
    "Рецепт не может быть обработан. Пожалуйста, проверьте формат и содержание текста.",
}

const SUBSCRIPTION_DETAIL_TO_CODE: Record<string, string> = {
  "Subscription required to access this resource.": "subscription_required",
  "Trial period has expired. Please subscribe to continue using this resource.": "trial_expired",
  "Your subscription is inactive. Please check your subscription status.": "subscription_inactive",
  "Your subscription has been cancelled. Please renew your subscription to continue using this resource.":
    "subscription_cancelled",
  "Your subscription payment is past due. Please update your payment information to continue using this resource.":
    "subscription_past_due",
  "Your subscription has expired. Please renew your subscription to continue using this resource.":
    "subscription_expired",
}

const FIELD_NAMES: Record<string, string> = {
  name: "Название",
  category: "Категория",
  recipe: "Рецепт",
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
  source_text: "Текст рецепта",
  payload: "AI-рецепт",
  ingredients: "Ингредиенты",
}

function translateMessage(msg: string): string {
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
  // "The shopping list cannot span more than N days."
  if (/^The shopping list cannot span more than \d+ days\./.test(msg)) {
    const n = msg.match(/\d+/)?.[0]
    return `Список покупок не может охватывать более ${n} дней.`
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
  // "Cannot select tariff for subscription with status 'xxx'" — dynamic
  if (/^Cannot select tariff for subscription with status/.test(msg))
    return "Смена тарифа недоступна для текущего статуса подписки."
  if (/^Invalid ingredient unit:/.test(msg)) return "Некорректная единица измерения ингредиента."
  if (/^Ingredient category not found:/.test(msg)) return "Категория ингредиента не найдена."
  if (/^Ingredient #\d+ missing keys:/.test(msg)) return "Проверьте данные ингредиентов."
  if (/^Ingredient #\d+/.test(msg)) return "Проверьте данные ингредиентов."
  if (/^Invalid payload structure:/.test(msg)) return "Некорректный формат AI-рецепта."
  if (/^This field is required/.test(msg)) return "Обязательное поле."
  if (/^This field may not be blank/.test(msg)) return "Поле не может быть пустым."
  if (/^This field may not be null/.test(msg)) return "Поле не может быть пустым."

  console.warn("Untranslated API message:", msg)
  return "Произошла ошибка. Попробуйте ещё раз."
}

async function parseError(response: Response) {
  const body = await response.json().catch(() => null)

  const err = new Error() as Error & { status: number; body: unknown; code: string | null }
  err.status = response.status
  err.body = body
  err.code = body?.code ?? SUBSCRIPTION_DETAIL_TO_CODE[body?.detail] ?? null
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
  const parts: string[] = []
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

export async function api<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  if (getRefresh() && isAccessExpired()) {
    if (!refreshing) {
      refreshing = refreshTokens().finally(() => {
        refreshing = null
      })
    }
    await refreshing
  }

  const headers = buildHeaders(options.headers as Record<string, string>, Boolean(options.body))

  let response = await fetch(API + url, { ...options, headers })

  if (response.status === 401 && getRefresh()) {
    if (!refreshing) {
      refreshing = refreshTokens().finally(() => {
        refreshing = null
      })
    }
    await refreshing // throws if refresh failed — caller handles it
    headers.Authorization = `Bearer ${getAccess()!}`
    response = await fetch(API + url, { ...options, headers })
  }

  if (response.status === 402) {
    const err = await parseError(response)
    const { useSubscriptionStore } = await import("../store/subscription")
    const subscriptionStore = useSubscriptionStore()
    subscriptionStore.setError(err.code, err.message)

    const { router } = await import("../router")
    if (router.currentRoute.value.path !== "/cabinet") {
      router.push("/cabinet")
    }

    throw err
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  if (response.status === 204) return null as T

  return (await response.json()) as T
}
