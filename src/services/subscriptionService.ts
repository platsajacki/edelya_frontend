import { api } from "../api/client"
import type {
  DTOSubscription,
  DTOTariff,
  DTOPaymentMethod,
  DTOAIRecipeUsage,
  DTOSubscriptionDictionary,
} from "@/types/subscription"
import type { DTOPaginatedResponse } from "@/types/common"

export interface DTOBindPaymentMethodResult {
  action: string
  confirmation_url: string
  context: string
  description: string
}

export interface DTOSelectTariffResult {
  action: string
  subscription: DTOSubscription | null
  confirmation_url?: string
  description?: string
}

export async function getMySubscription(): Promise<DTOSubscription | null> {
  try {
    return await api<DTOSubscription>("/api/v1/subscriptions/me/")
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export function startTrial(): Promise<DTOSubscription> {
  return api<DTOSubscription>("/api/v1/subscriptions/start-trial/", { method: "POST" })
}

export function getTrialDuration(): Promise<{ trial_duration: number }> {
  return api<{ trial_duration: number }>("/api/v1/subscriptions/tariffs/trial-duration/")
}

export function getSubscriptionDictionary(): Promise<DTOSubscriptionDictionary> {
  return api<DTOSubscriptionDictionary>("/api/v1/subscriptions/dictionary/")
}

export function getAIRecipeUsage(): Promise<DTOAIRecipeUsage> {
  return api<DTOAIRecipeUsage>("/api/v1/subscriptions/ai-recipe-usage/")
}

export function fetchTariffs(): Promise<DTOPaginatedResponse<DTOTariff>> {
  return api<DTOPaginatedResponse<DTOTariff>>("/api/v1/subscriptions/tariffs/")
}

export function selectTariff(tariffId: string): Promise<DTOSelectTariffResult> {
  return api<DTOSelectTariffResult>("/api/v1/subscriptions/select-tariff/", {
    method: "POST",
    body: JSON.stringify({ tariff_id: tariffId }),
  })
}

export async function getPaymentMethod(): Promise<DTOPaymentMethod | null> {
  try {
    return await api<DTOPaymentMethod>("/api/v1/subscriptions/payment-method/")
  } catch (err) {
    if ((err as { status?: number }).status === 404) return null
    throw err
  }
}

export function bindPaymentMethod(): Promise<DTOBindPaymentMethodResult> {
  return api<DTOBindPaymentMethodResult>("/api/v1/subscriptions/payment-method/", {
    method: "POST",
  })
}

export function deletePaymentMethod(): Promise<null> {
  return api<null>("/api/v1/subscriptions/payment-method/", { method: "DELETE" })
}

export function cancelSubscription(): Promise<DTOSubscription> {
  return api<DTOSubscription>("/api/v1/subscriptions/cancel/", { method: "POST" })
}

export function resumeSubscription(): Promise<DTOSubscription> {
  return api<DTOSubscription>("/api/v1/subscriptions/resume/", { method: "POST" })
}
