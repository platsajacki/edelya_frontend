import { defineStore } from "pinia"
import { getTrialDuration, startTrial as apiStartTrial } from "../services/subscriptionService"

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({
    errorCode: null,
    message: null,
    trialDays: null,
  }),

  actions: {
    setError(code, message) {
      this.errorCode = code
      this.message = message
    },

    clear() {
      this.errorCode = null
      this.message = null
    },

    async loadTrialDuration() {
      const data = await getTrialDuration()
      this.trialDays = data?.trial_duration ?? null
    },

    async startTrial() {
      return apiStartTrial()
    },
  },
})
