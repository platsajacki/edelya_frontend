import { defineStore } from "pinia"
import {
  fetchWeek,
  createCookingEvent,
  createMealPlanItem,
  updateCookingEvent,
  deleteCookingEvent,
  updateMealPlanItem,
  deleteMealPlanItem,
} from "../services/planningService"

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

function formatDateRange(startISO, endISO) {
  const fmt = (iso) => {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  }
  return `${fmt(startISO)} – ${fmt(endISO)}`
}

function emptyWeek(year, week) {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7))
  const day = simple.getUTCDay() || 7
  const monday = new Date(simple)
  monday.setUTCDate(simple.getUTCDate() - day + 1)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const toISO = (d) => d.toISOString().slice(0, 10)
  return {
    start_week: toISO(monday),
    end_week: toISO(sunday),
    meal_plan_items: [],
    cooking_events: [],
  }
}

export const usePlanningStore = defineStore("planning", {
  state: () => {
    const { year, week } = getISOWeek(new Date())
    return {
      year,
      week,
      weekData: emptyWeek(year, week),
      loading: false,
      toast: null,
    }
  },

  getters: {
    weekLabel(state) {
      if (!state.weekData) return ""
      return formatDateRange(state.weekData.start_week, state.weekData.end_week)
    },
  },

  actions: {
    async loadWeek() {
      this.loading = true
      this.toast = null
      try {
        this.weekData = await fetchWeek(this.year, this.week)
      } catch {
        this.weekData = emptyWeek(this.year, this.week)
        this.showToast("Не удалось загрузить неделю")
      } finally {
        this.loading = false
      }
    },

    showToast(message) {
      this.toast = message
      setTimeout(() => {
        if (this.toast === message) this.toast = null
      }, 3000)
    },

    async prevWeek() {
      if (this.week > 1) {
        this.week--
      } else {
        this.year--
        this.week = 52
      }
      await this.loadWeek()
    },

    async nextWeek() {
      if (this.week < 52) {
        this.week++
      } else {
        this.year++
        this.week = 1
      }
      await this.loadWeek()
    },

    async addCookingEvent(payload) {
      try {
        await createCookingEvent(payload)
        this.showToast("Готовка создана")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось создать готовку")
        throw err
      }
    },

    async addMealPlanItem(payload) {
      try {
        const existing = this.weekData.meal_plan_items
          .filter((m) => m.date === payload.date)
        const maxPos = existing.reduce((max, m) => Math.max(max, m.position ?? 0), 0)
        await createMealPlanItem({ ...payload, position: maxPos + 100 })
        this.showToast("Приём пищи добавлен")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось добавить приём пищи")
        throw err
      }
    },

    async editCookingEvent(id, payload) {
      try {
        await updateCookingEvent(id, payload)
        this.showToast("Готовка обновлена")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось обновить готовку")
        throw err
      }
    },

    async removeCookingEvent(id) {
      try {
        await deleteCookingEvent(id)
        this.showToast("Готовка удалена")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось удалить готовку")
        throw err
      }
    },

    async editMealPlanItem(id, payload) {
      try {
        await updateMealPlanItem(id, payload)
        this.showToast("Приём пищи обновлён")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось обновить приём пищи")
        throw err
      }
    },

    async removeMealPlanItem(id) {
      try {
        await deleteMealPlanItem(id)
        this.showToast("Приём пищи удалён")
        await this.loadWeek()
      } catch (err) {
        this.showToast("Не удалось удалить приём пищи")
        throw err
      }
    },
  },
})
