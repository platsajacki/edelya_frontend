import { defineStore } from "pinia"
import {
  getMySubscription,
  getTrialDuration,
  getSubscriptionDictionary,
  getAIRecipeUsage,
  startTrial as apiStartTrial,
  fetchTariffs as apiFetchTariffs,
  selectTariff as apiSelectTariff,
  getPaymentMethod as apiGetPaymentMethod,
  bindPaymentMethod as apiBindPaymentMethod,
  deletePaymentMethod as apiDeletePaymentMethod,
  cancelSubscription as apiCancelSubscription,
  resumeSubscription as apiResumeSubscription,
} from "../services/subscriptionService"
import type {
  DTOSubscription,
  DTOTariff,
  DTOPaymentMethod,
  DTOAIRecipeUsage,
  DTOSubscriptionDictionary,
} from "@/types/subscription"

const DICTIONARY_CACHE_KEY = "subscription_dictionary_cache"
const DICTIONARY_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({
    errorCode: null as string | null,
    message: null as string | null,
    trialDays: null as number | null,
    dictionary: null as DTOSubscriptionDictionary | null,
    dictionaryLoading: false,
    dictionaryError: null as string | null,
    aiRecipeUsage: null as DTOAIRecipeUsage | null,
    aiRecipeUsageLoading: false,
    aiRecipeUsageError: null as string | null,
    subscription: null as DTOSubscription | null,
    tariffs: [] as DTOTariff[],
    paymentMethod: null as DTOPaymentMethod | null,
  }),

  getters: {
    hasSubscription: (state): boolean => state.subscription !== null,

    isTrialActive: (state): boolean =>
      state.subscription?.status === "trial" &&
      state.subscription?.is_active === true &&
      state.subscription?.tariff?.is_trial_tariff === true,

    canCreateAIRecipes: (state): boolean =>
      state.subscription?.tariff?.can_create_ai_recipes === true,

    aiRecipeLimit: (state): number | null =>
      state.aiRecipeUsage?.limit ?? state.dictionary?.ai_recipe_limit_per_period ?? null,

    isAIRecipeLimitExceeded: (state): boolean =>
      state.aiRecipeUsage?.remaining !== undefined &&
      state.aiRecipeUsage?.remaining !== null &&
      Number(state.aiRecipeUsage.remaining) <= 0,

    daysLeft: (state): number | null => {
      const sub = state.subscription
      if (!sub || sub.status !== "trial" || !sub.is_active) return null
      // Prefer server-set end date; fall back to start + days_in_trial
      const endDate = sub.trial_ended_at
        ? new Date(sub.trial_ended_at)
        : sub.trial_started_at
          ? new Date(new Date(sub.trial_started_at).getTime() + sub.days_in_trial * 86_400_000)
          : null
      if (!endDate) return null
      const left = Math.ceil((endDate.getTime() - Date.now()) / 86_400_000)
      return Math.max(left, 0)
    },
  },

  actions: {
    setError(code: string | null, message: string | null) {
      this.errorCode = code
      this.message = message
    },

    clear() {
      this.errorCode = null
      this.message = null
    },

    async loadMySubscription() {
      this.subscription = await getMySubscription()
    },

    async loadTrialDuration() {
      const data = await getTrialDuration()
      this.trialDays = data?.trial_duration ?? null
    },

    async loadSubscriptionDictionary({ force = false }: { force?: boolean } = {}) {
      this.dictionaryError = null
      if (!force) {
        const cached = readDictionaryCache()
        if (cached) {
          this.dictionary = cached
          return cached
        }
      }
      this.dictionaryLoading = true
      try {
        const data = await getSubscriptionDictionary()
        this.dictionary = data
        writeDictionaryCache(data)
        return data
      } catch (err) {
        this.dictionaryError = (err as Error).message ?? "Не удалось загрузить параметры подписки."
        throw err
      } finally {
        this.dictionaryLoading = false
      }
    },

    async loadAIRecipeUsage() {
      this.aiRecipeUsageLoading = true
      this.aiRecipeUsageError = null
      try {
        const data = await getAIRecipeUsage()
        this.aiRecipeUsage = data
        return data
      } catch (err) {
        this.aiRecipeUsageError =
          (err as Error).message ?? "Не удалось загрузить лимит AI-рецептов."
        throw err
      } finally {
        this.aiRecipeUsageLoading = false
      }
    },

    async loadTariffs() {
      const data = await apiFetchTariffs()
      this.tariffs = data?.results ?? []
    },

    async startTrial() {
      const sub = await apiStartTrial()
      this.subscription = sub
      return sub
    },

    async selectTariff(tariffId: string) {
      const result = await apiSelectTariff(tariffId)
      if (result.action === "success") {
        this.subscription = result.subscription
      }
      return result
    },

    async loadPaymentMethod() {
      this.paymentMethod = await apiGetPaymentMethod()
    },

    async bindPaymentMethod() {
      return await apiBindPaymentMethod()
    },

    async deletePaymentMethod() {
      await apiDeletePaymentMethod()
      this.paymentMethod = null
    },

    async cancelSubscription() {
      const sub = await apiCancelSubscription()
      this.subscription = sub
      return sub
    },

    async resumeSubscription() {
      const sub = await apiResumeSubscription()
      this.subscription = sub
      return sub
    },
  },
})

function readDictionaryCache(): DTOSubscriptionDictionary | null {
  try {
    const raw = localStorage.getItem(DICTIONARY_CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw)
    if (!cache?.expiresAt || Date.now() > cache.expiresAt) {
      localStorage.removeItem(DICTIONARY_CACHE_KEY)
      return null
    }
    return cache.data ?? null
  } catch {
    localStorage.removeItem(DICTIONARY_CACHE_KEY)
    return null
  }
}

function writeDictionaryCache(data: DTOSubscriptionDictionary): void {
  try {
    localStorage.setItem(
      DICTIONARY_CACHE_KEY,
      JSON.stringify({
        data,
        expiresAt: Date.now() + DICTIONARY_CACHE_TTL_MS,
      })
    )
  } catch {
    // Cache is optional; UI can work with in-memory data only.
  }
}
