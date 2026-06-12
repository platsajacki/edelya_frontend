import { api } from "../api/client"

export async function getMySubscription() {
  try {
    return await api("/api/v1/subscriptions/me/")
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

export function startTrial() {
  return api("/api/v1/subscriptions/start-trial/", { method: "POST" })
}

export function getTrialDuration() {
  return api("/api/v1/subscriptions/tariffs/trial-duration/")
}

export function getSubscriptionDictionary() {
  return api("/api/v1/subscriptions/dictionary/")
}

export function getAIRecipeUsage() {
  return api("/api/v1/subscriptions/ai-recipe-usage/")
}

export function fetchTariffs() {
  return api("/api/v1/subscriptions/tariffs/")
}

export function selectTariff(tariffId) {
  return api("/api/v1/subscriptions/select-tariff/", {
    method: "POST",
    body: JSON.stringify({ tariff_id: tariffId }),
  })
}

export async function getPaymentMethod() {
  try {
    return await api("/api/v1/subscriptions/payment-method/")
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}

export function bindPaymentMethod() {
  return api("/api/v1/subscriptions/payment-method/", { method: "POST" })
}

export function deletePaymentMethod() {
  return api("/api/v1/subscriptions/payment-method/", { method: "DELETE" })
}

export function cancelSubscription() {
  return api("/api/v1/subscriptions/cancel/", { method: "POST" })
}

export function resumeSubscription() {
  return api("/api/v1/subscriptions/resume/", { method: "POST" })
}
