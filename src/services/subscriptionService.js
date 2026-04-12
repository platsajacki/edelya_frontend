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
