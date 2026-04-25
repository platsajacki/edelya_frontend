import { defineStore } from "pinia"
import {
  getMySubscription,
  getTrialDuration,
  startTrial as apiStartTrial,
  fetchTariffs as apiFetchTariffs,
  selectTariff as apiSelectTariff,
} from "../services/subscriptionService"

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({
    errorCode: null,
    message: null,
    trialDays: null,
    subscription: null,
    tariffs: [],
  }),

  getters: {
    hasSubscription: (state) => state.subscription !== null,

    isTrialActive: (state) =>
      state.subscription?.status === "trial" &&
      state.subscription?.is_active === true &&
      state.subscription?.tariff?.is_trial_tariff === true,

    daysLeft: (state) => {
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
    setError(code, message) {
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

    async loadTariffs() {
      const data = await apiFetchTariffs()
      this.tariffs = data?.results ?? []
    },

    async startTrial() {
      const sub = await apiStartTrial()
      this.subscription = sub
      return sub
    },

    async selectTariff(tariffId) {
      const result = await apiSelectTariff(tariffId)
      if (result.action === "success") {
        this.subscription = result.subscription
      }
      return result
    },
  },
})
