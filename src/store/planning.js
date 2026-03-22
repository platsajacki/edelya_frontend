import { defineStore } from "pinia"
import {
  fetchWeek,
  createCookingEvent,
  createMealPlanItem,
  updateCookingEvent,
  deleteCookingEvent,
  updateMealPlanItem,
  deleteMealPlanItem,
  batchUpdateMealPositions,
} from "../services/planningService"
import { recalcPositions } from "../utils/recalcPositions"

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
      loadError: false,
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
      this.loadError = false
      this.toast = null
      try {
        this.weekData = await fetchWeek(this.year, this.week)
      } catch {
        this.weekData = emptyWeek(this.year, this.week)
        this.loadError = true
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
        await createMealPlanItem(payload)
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

    async handleDragEnd({ itemId, fromDate, toDate, oldIndex, newIndex, type }) {
      const snapshot = JSON.parse(JSON.stringify(this.weekData))

      try {
        if (type === 'meals') {
          await this._handleMealDrag(itemId, fromDate, toDate, oldIndex, newIndex)
          await this.loadWeek()
        } else if (type === 'cooking') {
          await this._handleCookingDrag(itemId, fromDate, toDate)
          // Backend moves related objects — need fresh data
          await this.loadWeek()
        }
      } catch {
        this.weekData = snapshot
        this.showToast("Не удалось переместить")
      }
    },

    _positionBetween(dayItems, newIndex) {
      const prev = newIndex > 0 ? dayItems[newIndex - 1].position : 0
      const next = newIndex < dayItems.length ? dayItems[newIndex].position : prev + 200

      const mid = Math.floor((prev + next) / 2)
      if (mid > prev && mid < next) return { position: mid, needsRecalc: false }

      // No integer space between neighbors — full recalc needed
      return { position: null, needsRecalc: true }
    },

    async _handleMealDrag(itemId, fromDate, toDate, oldIndex, newIndex) {
      const items = this.weekData.meal_plan_items
      const movedItem = items.find((m) => m.id === itemId)
      if (!movedItem) return

      if (fromDate === toDate) {
        // Within same day — reorder
        const dayItems = items
          .filter((m) => m.date === fromDate)
          .sort((a, b) => a.position - b.position)

        const fromIdx = dayItems.indexOf(movedItem)
        if (fromIdx !== -1) dayItems.splice(fromIdx, 1)

        const { position, needsRecalc } = this._positionBetween(dayItems, newIndex)

        if (!needsRecalc) {
          movedItem.position = position
          await updateMealPlanItem(movedItem.id, { date: movedItem.date, position })
        } else {
          dayItems.splice(newIndex, 0, movedItem)
          await this._recalcAndPatch(dayItems, items)
        }
      } else {
        // Cross-day move — source day is not touched
        movedItem.date = toDate

        const targetItems = items
          .filter((m) => m.date === toDate && m.id !== itemId)
          .sort((a, b) => a.position - b.position)

        const { position, needsRecalc } = this._positionBetween(targetItems, newIndex)

        if (!needsRecalc) {
          movedItem.position = position
          await updateMealPlanItem(movedItem.id, { date: toDate, position })
        } else {
          targetItems.splice(newIndex, 0, movedItem)
          await this._recalcAndPatch(targetItems, items)
        }
      }
    },

    async _recalcAndPatch(dayItems, allItems) {
      const oldPositions = new Map(dayItems.map((m) => [m.id, m.position]))
      const updated = recalcPositions(dayItems)

      for (const u of updated) {
        const orig = allItems.find((m) => m.id === u.id)
        if (orig) orig.position = u.position
      }

      const changed = updated.filter((m) => m.position !== oldPositions.get(m.id))
      if (changed.length) {
        await batchUpdateMealPositions(
          changed.map((m) => ({ id: m.id, date: m.date, position: m.position }))
        )
      }
    },

    async _handleCookingDrag(itemId, fromDate, toDate) {
      if (fromDate === toDate) return

      const event = this.weekData.cooking_events.find((e) => e.id === itemId)
      if (!event) return

      event.cooking_date = toDate
      await updateCookingEvent(itemId, { cooking_date: toDate })
    },
  },
})
