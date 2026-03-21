import { defineStore } from "pinia"
import { fetchDishes, fetchDishCategories, deleteDish } from "../services/dishService"
import { isDishOwn } from "../utils/dishOwnership"

export const useRecipesStore = defineStore("recipes", {
  state: () => ({
    dishes: [],
    categories: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    page: 1,
    filters: {
      ownership: "all", // 'all' | 'own' | 'global'
      categoryId: null,
      search: "",
    },
    toast: null,
  }),

  getters: {
    /** Build API query params from current filters */
    queryParams(state) {
      const params = { owened_first: true }
      if (state.filters.ownership === "own") params.only_owned = true
      if (state.filters.ownership === "global") params.only_global = true
      if (state.filters.categoryId) params.category = state.filters.categoryId
      if (state.filters.search.trim()) params.name__icontains = state.filters.search.trim()
      return params
    },

    /** Dishes filtered by current ownership tab */
    ownDishes(state) {
      return state.dishes.filter((d) => isDishOwn(d))
    },

    sharedDishes(state) {
      return state.dishes.filter((d) => !isDishOwn(d))
    },

    /** Active dishes based on selected tab */
    activeDishes(state) {
      if (state.filters.ownership === "own") return this.ownDishes
      if (state.filters.ownership === "global") return this.sharedDishes
      return state.dishes
    },

    hasActiveFilters(state) {
      return (
        state.filters.categoryId !== null ||
        state.filters.search.trim() !== ""
      )
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
      this.loading = true
      this.page = 1
      try {
        const params = { ...this.queryParams, page: 1 }
        const data = await fetchDishes(params)
        this.dishes = data.results ?? []
        this.hasMore = !!data.next
      } catch {
        this.dishes = []
        this.hasMore = false
        this.showToast("Не удалось загрузить блюда")
      } finally {
        this.loading = false
      }
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore) return
      this.loadingMore = true
      this.page++
      try {
        const params = { ...this.queryParams, page: this.page }
        const data = await fetchDishes(params)
        this.dishes.push(...(data.results ?? []))
        this.hasMore = !!data.next
      } catch {
        this.page--
        this.showToast("Не удалось загрузить ещё блюда")
      } finally {
        this.loadingMore = false
      }
    },

    setFilter(key, value) {
      this.filters[key] = value
      this.loadDishes()
    },

    resetFilters() {
      this.filters.ownership = "all"
      this.filters.categoryId = null
      this.filters.search = ""
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
      this.loadDishes()
    },

    onDishUpdated() {
      this.showToast("Блюдо обновлено")
      this.loadDishes()
    },

    showToast(message) {
      this.toast = message
      setTimeout(() => {
        if (this.toast === message) this.toast = null
      }, 3000)
    },
  },
})
