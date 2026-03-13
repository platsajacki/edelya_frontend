import { defineStore } from "pinia"
import { login, telegramLogin } from "../services/authService"
import { clearTokens, getAccess, getRefreshExp } from "../storage/tokenStorage"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null
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

      await telegramLogin(tg.initData)
      this.user = tg.initDataUnsafe?.user ?? null
    },

    logout() {
      clearTokens()
      this.user = null
    }
  }
})
