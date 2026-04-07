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
      nextWeekData: null,
      loading: false,
      loadingNextWeek: false,
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

    async loadNextWeek(year, week) {
      if (this.nextWeekData || this.loadingNextWeek) return
      this.loadingNextWeek = true
      try {
        this.nextWeekData = await fetchWeek(year, week)
      } catch {
        this.nextWeekData = emptyWeek(year, week)
      } finally {
        this.loadingNextWeek = false
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
      this.nextWeekData = null
      await this.loadWeek()
    },

    async nextWeek() {
      if (this.week < 52) {
        this.week++
      } else {
        this.year++
        this.week = 1
      }
      this.nextWeekData = null
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
      const nextSnapshot = this.nextWeekData ? JSON.parse(JSON.stringify(this.nextWeekData)) : null
      const nextInvolved = this.nextWeekData && (
        (fromDate >= this.nextWeekData.start_week && fromDate <= this.nextWeekData.end_week) ||
        (toDate >= this.nextWeekData.start_week && toDate <= this.nextWeekData.end_week)
      )

      try {
        if (type === 'meals') {
          await this._handleMealDrag(itemId, fromDate, toDate, oldIndex, newIndex)
        } else if (type === 'cooking') {
          await this._handleCookingDrag(itemId, fromDate, toDate)
        }
        // Fire-and-forget background sync — no loading flag, no visual jump
        this._silentRefreshBackground(nextInvolved)
      } catch {
        this.weekData = snapshot
        if (nextSnapshot) this.nextWeekData = nextSnapshot
        this.showToast("Не удалось переместить")
      }
    },

    async _silentRefreshBackground(includeNext) {
      try {
        const fresh = await fetchWeek(this.year, this.week)
        this.weekData.meal_plan_items.splice(0, Infinity, ...fresh.meal_plan_items)
        this.weekData.cooking_events.splice(0, Infinity, ...fresh.cooking_events)
        if (includeNext && this.nextWeekData) {
          const { year, week } = getISOWeek(new Date(this.nextWeekData.start_week + 'T00:00:00'))
          const freshNext = await fetchWeek(year, week)
          this.nextWeekData.meal_plan_items.splice(0, Infinity, ...freshNext.meal_plan_items)
          this.nextWeekData.cooking_events.splice(0, Infinity, ...freshNext.cooking_events)
        }
      } catch {
        // Optimistic state remains — silent failure is acceptable
      }
    },

    _mealItemsForDate(date) {
      if (this.nextWeekData &&
          date >= this.nextWeekData.start_week &&
          date <= this.nextWeekData.end_week) {
        return this.nextWeekData.meal_plan_items
      }
      return this.weekData.meal_plan_items
    },

    _cookingEventsForDate(date) {
      if (this.nextWeekData &&
          date >= this.nextWeekData.start_week &&
          date <= this.nextWeekData.end_week) {
        return this.nextWeekData.cooking_events
      }
      return this.weekData.cooking_events
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
      const fromItems = this._mealItemsForDate(fromDate)
      const movedItem = fromItems.find((m) => m.id === itemId)
      if (!movedItem) return

      if (fromDate === toDate) {
        // Within same day — reorder
        const dayItems = fromItems
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
          await this._recalcAndPatch(dayItems, fromItems)
        }
      } else {
        // Cross-day move
        movedItem.date = toDate

        const toItems = this._mealItemsForDate(toDate)
        const targetItems = toItems
          .filter((m) => m.date === toDate && m.id !== itemId)
          .sort((a, b) => a.position - b.position)

        const { position, needsRecalc } = this._positionBetween(targetItems, newIndex)

        if (!needsRecalc) {
          movedItem.position = position
          await updateMealPlanItem(movedItem.id, { date: toDate, position })
        } else {
          targetItems.splice(newIndex, 0, movedItem)
          await this._recalcAndPatch(targetItems, toItems)
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

      const events = this._cookingEventsForDate(fromDate)
      const event = events.find((e) => e.id === itemId)
      if (!event) return

      event.cooking_date = toDate
      await updateCookingEvent(itemId, { cooking_date: toDate })
    },
  },
})
