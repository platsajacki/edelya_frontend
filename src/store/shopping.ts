import { defineStore } from "pinia"
import {
  fetchShoppingLists,
  fetchShoppingList,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  recalculateShoppingList,
  fetchShoppingListItems,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
} from "../services/shoppingService"
import type { DTOShoppingList, DTOShoppingListItem } from "@/types/shopping"

const _adjustTimers: Record<string, ReturnType<typeof setTimeout>> = {}
const _adjustPrev: Record<string, string> = {}

export const useShoppingStore = defineStore("shopping", {
  state: () => ({
    lists: [] as DTOShoppingList[],
    currentList: null as DTOShoppingList | null,
    items: [] as DTOShoppingListItem[],
    loading: false,
    loadingMore: false,
    loadingItems: false,
    hasMore: false,
    page: 1,
    filters: {
      search: "",
      dateFrom: "",
    },
    toast: null as string | null,
  }),

  getters: {
    queryParams(state): Record<string, string> {
      const params: Record<string, string> = { ordering: "-created_at" }
      if (state.filters.search.trim()) params.name__icontains = state.filters.search.trim()
      if (state.filters.dateFrom) params.date_from__gte = state.filters.dateFrom
      return params
    },

    groupedItems(state): { name: string; items: DTOShoppingListItem[] }[] {
      const groups: Record<string, DTOShoppingListItem[]> = {}
      const uncategorized: DTOShoppingListItem[] = []

      for (const item of state.items) {
        const catName = item.ingredient?.category?.name
        if (catName) {
          if (!groups[catName]) groups[catName] = []
          groups[catName].push(item)
        } else {
          uncategorized.push(item)
        }
      }

      const sorted = Object.keys(groups)
        .sort((a, b) => a.localeCompare(b, "ru"))
        .map((name) => ({
          name,
          items: groups[name].sort((a, b) => a.position - b.position),
        }))

      if (uncategorized.length) {
        sorted.push({
          name: "Без категории",
          items: uncategorized.sort((a, b) => a.position - b.position),
        })
      }

      return sorted
    },

    uncheckedCount(state): number {
      return state.items.filter((i) => !i.is_checked).length
    },

    checkedCount(state): number {
      return state.items.filter((i) => i.is_checked).length
    },
  },

  actions: {
    async loadLists() {
      this.loading = true
      this.page = 1
      try {
        const params = { ...this.queryParams, page: 1 }
        const data = await fetchShoppingLists(params)
        this.lists = data.results ?? []
        this.hasMore = !!data.next
      } catch {
        this.lists = []
        this.hasMore = false
        this.showToast("Не удалось загрузить списки покупок")
      } finally {
        this.loading = false
      }
    },

    async loadMoreLists() {
      if (this.loadingMore || !this.hasMore) return
      this.loadingMore = true
      this.page++
      try {
        const params = { ...this.queryParams, page: this.page }
        const data = await fetchShoppingLists(params)
        this.lists.push(...(data.results ?? []))
        this.hasMore = !!data.next
      } catch {
        this.page--
        this.showToast("Не удалось загрузить ещё списки")
      } finally {
        this.loadingMore = false
      }
    },

    setFilter(key: "search" | "dateFrom", value: string) {
      this.filters[key] = value
      void this.loadLists()
    },

    async loadList(id: string) {
      this.loading = true
      try {
        this.currentList = await fetchShoppingList(id)
      } catch {
        this.currentList = null
        this.showToast("Не удалось загрузить список покупок")
      } finally {
        this.loading = false
      }
    },

    async loadItems(listId: string) {
      this.loadingItems = true
      try {
        const data = await fetchShoppingListItems(listId, { page_size: 500 })
        this.items = data.results ?? []
      } catch {
        this.items = []
        this.showToast("Не удалось загрузить позиции")
      } finally {
        this.loadingItems = false
      }
    },

    async createList(payload: Partial<DTOShoppingList>): Promise<DTOShoppingList> {
      const data = await createShoppingList(payload)
      this.lists.unshift(data)
      this.showToast("Список создан")
      return data
    },

    async updateList(id: string, payload: Partial<DTOShoppingList>): Promise<DTOShoppingList> {
      const data = await updateShoppingList(id, payload)
      const idx = this.lists.findIndex((l) => l.id === id)
      if (idx !== -1) this.lists[idx] = data
      if (this.currentList?.id === id) this.currentList = data
      this.showToast("Список обновлён")
      return data
    },

    async removeList(id: string) {
      await deleteShoppingList(id)
      this.lists = this.lists.filter((l) => l.id !== id)
      if (this.currentList?.id === id) this.currentList = null
      this.showToast("Список удалён")
    },

    async recalculateList(id: string) {
      await recalculateShoppingList(id)
      await this.loadItems(id)
      this.showToast("Список пересчитан")
    },

    async addItem(
      listId: string,
      payload: Partial<DTOShoppingListItem>
    ): Promise<DTOShoppingListItem> {
      const data = await createShoppingListItem(listId, payload)
      this.items.push(data)
      this.showToast("Позиция добавлена")
      return data
    },

    async updateItemAmount(
      listId: string,
      itemId: string,
      amount: string
    ): Promise<DTOShoppingListItem> {
      const data = await updateShoppingListItem(listId, itemId, { amount })
      const idx = this.items.findIndex((i) => i.id === itemId)
      if (idx !== -1) Object.assign(this.items[idx], data)
      this.showToast("Количество обновлено")
      return data
    },

    async toggleItemChecked(listId: string, item: DTOShoppingListItem) {
      const wasChecked = item.is_checked
      const wasCheckedAt = item.checked_at

      // Optimistic update
      item.is_checked = !wasChecked
      item.checked_at = item.is_checked ? new Date().toISOString() : null

      try {
        const updated = await updateShoppingListItem(listId, item.id, {
          is_checked: item.is_checked,
          checked_at: item.checked_at,
        })
        Object.assign(item, updated)
      } catch {
        // Rollback
        item.is_checked = wasChecked
        item.checked_at = wasCheckedAt
        this.showToast("Не удалось обновить статус")
      }
    },

    async adjustItemAmount(listId: string, item: DTOShoppingListItem, delta: number) {
      const oldAmount = parseFloat(item.amount)
      const newAmount = parseFloat(Math.max(0, oldAmount + delta).toFixed(4))
      if (newAmount === oldAmount) return

      item.amount = String(newAmount)

      clearTimeout(_adjustTimers[item.id])

      if (_adjustPrev[item.id] === undefined) {
        _adjustPrev[item.id] = String(oldAmount)
      }

      _adjustTimers[item.id] = setTimeout(async () => {
        const prevVal = _adjustPrev[item.id]
        delete _adjustTimers[item.id]
        delete _adjustPrev[item.id]

        try {
          const updated = await updateShoppingListItem(listId, item.id, {
            amount: item.amount,
          })
          if (!_adjustTimers[item.id]) {
            Object.assign(item, updated)
          }
        } catch {
          item.amount = prevVal
          this.showToast("Не удалось изменить количество")
        }
      }, 600)
    },

    async removeItem(listId: string, itemId: string) {
      await deleteShoppingListItem(listId, itemId)
      this.items = this.items.filter((i) => i.id !== itemId)
      this.showToast("Позиция удалена")
    },

    showToast(message: string) {
      this.toast = message
      setTimeout(() => {
        if (this.toast === message) this.toast = null
      }, 3000)
    },
  },
})
