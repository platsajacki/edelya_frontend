import { defineStore } from "pinia"
import { fetchDishes, fetchDishCategories, deleteDish } from "../services/dishService"

const DEFAULT_SORTING = "-created_at"

export const SORT_OPTIONS = [
  { value: "-created_at", label: "Сначала новые" },
  { value: "created_at", label: "Сначала старые" },
  { value: "name", label: "По имени А–Я" },
  { value: "-name", label: "По имени Я–А" },
]

export const useRecipesStore = defineStore("recipes", {
  state: () => ({
    dishes: [],
    categories: [],

    initialLoading: false,
    loadingMore: false,
    refreshing: false,

    initialError: null,
    loadMoreError: null,

    hasMore: false,
    page: 1,

    filters: {
      ownership: "own",
      categoryId: null,
      search: "",
      sorting: DEFAULT_SORTING,
    },

    toast: null,
    _loadId: 0,
  }),

  getters: {
    queryParams(state) {
      const params = {}
      if (state.filters.sorting) params.ordering = state.filters.sorting
      if (state.filters.ownership === "own") params.only_owned = true
      if (state.filters.ownership === "global") params.only_global = true
      if (state.filters.categoryId) params.category = state.filters.categoryId
      if (state.filters.search.trim()) params.name__icontains = state.filters.search.trim()
      return params
    },

    hasActiveFilters(state) {
      return (
        state.filters.categoryId !== null ||
        state.filters.search.trim() !== ""
      )
    },

    hasNonDefaultSort(state) {
      return state.filters.sorting !== DEFAULT_SORTING
    },

    sortLabel(state) {
      return SORT_OPTIONS.find((o) => o.value === state.filters.sorting)?.label ?? ""
    },
  },

  actions: {
    async loadCategories() {
      try {
        const data = await fetchDishCategories()
        this.categories = data.results ?? []
      } catch {
        this.categories = []
      }
    },

    async loadDishes() {
      const loadId = ++this._loadId
      this.initialLoading = true
      this.initialError = null
      this.loadMoreError = null
      this.page = 1
      try {
        const params = { ...this.queryParams, page: 1 }
        const data = await fetchDishes(params)
        if (loadId !== this._loadId) return
        this.dishes = data.results ?? []
        this.hasMore = !!data.next
      } catch {
        if (loadId !== this._loadId) return
        this.dishes = []
        this.hasMore = false
        this.initialError = "Не удалось загрузить блюда"
      } finally {
        if (loadId === this._loadId) {
          this.initialLoading = false
        }
      }
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore || this.initialLoading) return
      this.loadingMore = true
      this.loadMoreError = null
      this.page++
      try {
        const params = { ...this.queryParams, page: this.page }
        const data = await fetchDishes(params)
        this.dishes.push(...(data.results ?? []))
        this.hasMore = !!data.next
      } catch {
        this.page--
        this.loadMoreError = "Не удалось загрузить ещё блюда"
      } finally {
        this.loadingMore = false
      }
    },

    async refresh() {
      const loadId = ++this._loadId
      this.refreshing = true
      this.initialError = null
      this.loadMoreError = null
      this.page = 1
      try {
        const params = { ...this.queryParams, page: 1 }
        const data = await fetchDishes(params)
        if (loadId !== this._loadId) return
        this.dishes = data.results ?? []
        this.hasMore = !!data.next
      } catch {
        if (loadId !== this._loadId) return
        this.showToast("Не удалось обновить список")
      } finally {
        if (loadId === this._loadId) {
          this.refreshing = false
        }
      }
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.loadDishes()
    },

    setSorting(value) {
      this.filters.sorting = value
      this.refresh()
    },

    resetFilters() {
      this.filters.categoryId = null
      this.filters.search = ""
      this.filters.sorting = DEFAULT_SORTING
      this.loadDishes()
    },

    async removeDish(id) {
      try {
        await deleteDish(id)
        this.dishes = this.dishes.filter((d) => d.id !== id)
        this.showToast("Блюдо удалено")
      } catch {
        this.showToast("Не удалось удалить блюдо")
      }
    },

    onDishCreated() {
      this.showToast("Блюдо создано")
      this.refresh()
    },

    onDishUpdated() {
      this.showToast("Блюдо обновлено")
      this.refresh()
    },

    showToast(message) {
      this.toast = message
      setTimeout(() => {
        if (this.toast === message) this.toast = null
      }, 3000)
    },
  },
})
