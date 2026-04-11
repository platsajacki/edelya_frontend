import { defineStore } from "pinia"

export const useSubscriptionStore = defineStore("subscription", {
  state: () => ({
    errorCode: null,
    message: null,
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
  },
})
