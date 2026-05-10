import { defineStore } from "pinia"
import { login, telegramLogin, telegramLoginWithConsent } from "../services/authService"
import { clearTokens, getAccess, getRefreshExp, saveTokens } from "../storage/tokenStorage"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    requiresConsent: false,
    consentFields: [],
  }),

  actions: {
    async init() {
      const refreshExp = getRefreshExp()
      const hasValidSession = getAccess() && (refreshExp === null || Date.now() / 1000 < refreshExp)

      if (hasValidSession) {
        const tg = window.Telegram?.WebApp
        if (tg?.initDataUnsafe?.user) {
          this.user = tg.initDataUnsafe.user
        } else if (import.meta.env.DEV) {
          this.user = { first_name: "Developer" }
        }
        return
      }

      if (import.meta.env.VITE_DEBUG === "1") {
        await this.debugLogin()
      } else {
        await this.tgLogin()
      }
    },

    async debugLogin() {
      const username = import.meta.env.VITE_DEBUG_USER
      const password = import.meta.env.VITE_DEBUG_PASSWORD
      await login(username, password)
      this.user = { first_name: "Developer" }
    },

    async tgLogin() {
      const tg = window.Telegram?.WebApp
      if (!tg || !tg.initData) return

      tg.ready()
      tg.expand()

      const result = await telegramLogin(tg.initData)
      if (result.ok) {
        saveTokens(result.tokens)
        this.user = tg.initDataUnsafe?.user ?? null
      } else {
        this.requiresConsent = true
        this.consentFields = result.consents
      }
    },

    async submitConsent(terms, marketing) {
      const tg = window.Telegram?.WebApp
      if (!tg?.initData) throw new Error("Нет данных Telegram.")
      const tokens = await telegramLoginWithConsent(tg.initData, terms, marketing)
      saveTokens(tokens)
      this.user = tg.initDataUnsafe?.user ?? null
      this.requiresConsent = false
      this.consentFields = []
    },

    logout() {
      clearTokens()
      this.user = null
      this.requiresConsent = false
      this.consentFields = []
    }
  }
})
