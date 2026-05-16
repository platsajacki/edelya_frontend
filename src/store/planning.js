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

function lastISOWeek(year) {
  // Dec 28 is always in the last ISO week of the year
  return getISOWeek(new Date(year, 11, 28)).week
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

let _opCounter = 0

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
      savingItemIds: [],
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
        this.week = lastISOWeek(this.year)
      }
      this.nextWeekData = null
      await this.loadWeek()
    },

    async nextWeek() {
      if (this.week < lastISOWeek(this.year)) {
        this.week++
      } else {
        this.year++
        this.week = 1
      }
      this.nextWeekData = null
      await this.loadWeek()
    },

    async _refreshAfterMutation() {
      const refreshes = [this.loadWeek()]
      if (this.nextWeekData) {
        const { year, week } = getISOWeek(new Date(this.nextWeekData.start_week + 'T00:00:00'))
        refreshes.push(
          fetchWeek(year, week)
            .then((data) => { this.nextWeekData = data })
            .catch(() => {})
        )
      }
      await Promise.all(refreshes)
    },

    async addCookingEvent(payload) {
      try {
        await createCookingEvent(payload)
        this.showToast("Готовка создана")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось создать готовку")
        throw err
      }
    },

    async addMealPlanItem(payload) {
      try {
        await createMealPlanItem(payload)
        this.showToast("Приём пищи добавлен")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось добавить приём пищи")
        throw err
      }
    },

    async editCookingEvent(id, payload) {
      try {
        await updateCookingEvent(id, payload)
        this.showToast("Готовка обновлена")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось обновить готовку")
        throw err
      }
    },

    async removeCookingEvent(id) {
      try {
        await deleteCookingEvent(id)
        this.showToast("Готовка удалена")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось удалить готовку")
        throw err
      }
    },

    async editMealPlanItem(id, payload) {
      try {
        await updateMealPlanItem(id, payload)
        this.showToast("Приём пищи обновлён")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось обновить приём пищи")
        throw err
      }
    },

    async removeMealPlanItem(id) {
      try {
        await deleteMealPlanItem(id)
        this.showToast("Приём пищи удалён")
        await this._refreshAfterMutation()
      } catch (err) {
        this.showToast("Не удалось удалить приём пищи")
        throw err
      }
    },

    async handleDragEnd({ itemId, fromDate, toDate, oldIndex, newIndex, type }) {
      const opId = ++_opCounter
      const snapshot = JSON.parse(JSON.stringify(this.weekData))
      const nextSnapshot = this.nextWeekData ? JSON.parse(JSON.stringify(this.nextWeekData)) : null
      const currentInvolved =
        (fromDate >= this.weekData.start_week && fromDate <= this.weekData.end_week) ||
        (toDate   >= this.weekData.start_week && toDate   <= this.weekData.end_week)
      const nextInvolved = !!this.nextWeekData

      if (!this.savingItemIds.includes(itemId)) {
        this.savingItemIds.push(itemId)
      }

      try {
        if (type === 'meals') {
          await this._handleMealDrag(itemId, fromDate, toDate, oldIndex, newIndex)
        } else if (type === 'cooking') {
          await this._handleCookingDrag(itemId, fromDate, toDate)
        }
        if (opId === _opCounter) {
          this._silentRefreshBackground(currentInvolved, nextInvolved, opId)
        }
      } catch (err) {
        if (opId === _opCounter) {
          this.weekData = snapshot
          if (nextSnapshot) this.nextWeekData = nextSnapshot
        }
        this.showToast(err?.message || "Не удалось переместить")
      } finally {
        const idx = this.savingItemIds.indexOf(itemId)
        if (idx !== -1) this.savingItemIds.splice(idx, 1)
      }
    },

    async _silentRefreshBackground(includeCurrent, includeNext, opId) {
      try {
        const fetches = []
        if (includeCurrent) {
          fetches.push(fetchWeek(this.year, this.week))
        }
        if (includeNext && this.nextWeekData) {
          const { year, week } = getISOWeek(new Date(this.nextWeekData.start_week + 'T00:00:00'))
          fetches.push(fetchWeek(year, week))
        }
        const results = await Promise.all(fetches)
        // Discard if a newer drag started while this fetch was in-flight
        if (opId !== _opCounter) return
        let i = 0
        if (includeCurrent) {
          const fresh = results[i++]
          this.weekData.meal_plan_items.splice(0, Infinity, ...fresh.meal_plan_items)
          this.weekData.cooking_events.splice(0, Infinity, ...fresh.cooking_events)
        }
        if (includeNext && this.nextWeekData) {
          const freshNext = results[i]
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
        const toItems = this._mealItemsForDate(toDate)

        // Transfer between datasets when crossing week boundaries
        if (fromItems !== toItems) {
          const idx = fromItems.indexOf(movedItem)
          if (idx !== -1) fromItems.splice(idx, 1)
          toItems.push(movedItem)
        }

        movedItem.date = toDate

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

      const fromEvents = this._cookingEventsForDate(fromDate)
      const event = fromEvents.find((e) => e.id === itemId)
      if (!event) return

      const toEvents = this._cookingEventsForDate(toDate)

      // Transfer between datasets when crossing week boundaries
      if (fromEvents !== toEvents) {
        const idx = fromEvents.indexOf(event)
        if (idx !== -1) fromEvents.splice(idx, 1)
        toEvents.push(event)
      }

      // Compute day shift delta (backend shifts linked meal_plan_items by the same amount)
      const deltaDays = Math.round(
        (new Date(toDate + 'T00:00:00').getTime() - new Date(fromDate + 'T00:00:00').getTime()) / 86400000
      )

      // Optimistically update cooking event date
      event.cooking_date = toDate

      // Optimistically shift all linked meal_plan_items by the same delta
      const linkedItems = [
        ...this.weekData.meal_plan_items,
        ...(this.nextWeekData ? this.nextWeekData.meal_plan_items : []),
      ].filter(m => m.cooking_event === itemId)

      for (const item of linkedItems) {
        const oldDate = item.date
        const d = new Date(oldDate + 'T00:00:00')
        d.setDate(d.getDate() + deltaDays)
        const newDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

        if (this.nextWeekData) {
          const nextStart = this.nextWeekData.start_week
          if (oldDate < nextStart && newDate >= nextStart) {
            const i = this.weekData.meal_plan_items.indexOf(item)
            if (i !== -1) this.weekData.meal_plan_items.splice(i, 1)
            this.nextWeekData.meal_plan_items.push(item)
          } else if (oldDate >= nextStart && newDate < nextStart) {
            const i = this.nextWeekData.meal_plan_items.indexOf(item)
            if (i !== -1) this.nextWeekData.meal_plan_items.splice(i, 1)
            this.weekData.meal_plan_items.push(item)
          }
        }

        item.date = newDate
      }

      const response = await updateCookingEvent(itemId, { cooking_date: toDate })

      // Sync linked meal_plan_items from server response (canonical dates from backend)
      if (response?.meal_plan_items?.length) {
        const allItems = [
          ...this.weekData.meal_plan_items,
          ...(this.nextWeekData ? this.nextWeekData.meal_plan_items : []),
        ]
        for (const serverItem of response.meal_plan_items) {
          const local = allItems.find(m => m.id === serverItem.id)
          if (local) {
            local.date = serverItem.date
            local.position = serverItem.position
          }
        }
      }
    },
  },
})
