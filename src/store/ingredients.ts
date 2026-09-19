import { defineStore } from "pinia"
import { fetchIngredients, fetchIngredientCategories } from "../services/ingredientService"
import type { DTOIngredient, DTOIngredientCategory } from "@/types/ingredient"
import { sortLabel } from "../utils/sortOptions"

const DEFAULT_SORTING = "name"

export const useIngredientsStore = defineStore("ingredients", {
  state: () => ({
    items: [] as DTOIngredient[],
    categories: [] as DTOIngredientCategory[],

    initialLoading: false,
    loadingMore: false,
    refreshing: false,

    initialError: null as string | null,
    loadMoreError: null as string | null,

    hasMore: false,
    page: 1,

    filters: {
      ownership: "own" as "own" | "global",
      categoryId: null as string | null,
      search: "",
      sorting: DEFAULT_SORTING,
    },

    toast: null as string | null,
    _loadId: 0,
  }),

  getters: {
    queryParams(state): Record<string, unknown> {
      const params: Record<string, unknown> = { ordering: state.filters.sorting }
      if (state.filters.ownership === "own") params.only_owned = true
      if (state.filters.ownership === "global") params.only_global = true
      if (state.filters.categoryId) params.category = state.filters.categoryId
      if (state.filters.search.trim()) params.search = state.filters.search.trim()
      return params
    },

    hasActiveFilters(state): boolean {
      return state.filters.categoryId !== null || state.filters.search.trim() !== ""
    },

    sortLabel(state): string {
      return sortLabel(state.filters.sorting)
    },
  },

  actions: {
    async loadCategories() {
      try {
        const data = await fetchIngredientCategories()
        this.categories = data.results ?? []
      } catch {
        this.categories = []
      }
    },

    startFirstPageLoad(): number {
      this.initialError = null
      this.loadMoreError = null
      this.page = 1
      return ++this._loadId
    },

    async fetchFirstPage(loadId: number) {
      const data = await fetchIngredients({ ...this.queryParams, page: 1 })
      if (loadId !== this._loadId) return
      this.items = data.results ?? []
      this.hasMore = !!data.next
    },

    async load() {
      const loadId = this.startFirstPageLoad()
      this.initialLoading = true
      try {
        await this.fetchFirstPage(loadId)
      } catch {
        if (loadId !== this._loadId) return
        this.items = []
        this.hasMore = false
        this.initialError = "Не удалось загрузить ингредиенты"
      } finally {
        if (loadId === this._loadId) this.initialLoading = false
      }
    },

    async loadMore() {
      if (this.loadingMore || !this.hasMore || this.initialLoading) return
      this.loadingMore = true
      this.loadMoreError = null
      this.page++
      try {
        const data = await fetchIngredients({ ...this.queryParams, page: this.page })
        this.items.push(...(data.results ?? []))
        this.hasMore = !!data.next
      } catch {
        this.page--
        this.loadMoreError = "Не удалось загрузить ещё ингредиенты"
      } finally {
        this.loadingMore = false
      }
    },

    async refresh() {
      const loadId = this.startFirstPageLoad()
      this.refreshing = true
      try {
        await this.fetchFirstPage(loadId)
      } catch {
        if (loadId !== this._loadId) return
        this.showToast("Не удалось обновить список")
      } finally {
        if (loadId === this._loadId) this.refreshing = false
      }
    },

    setFilter(key: "ownership" | "categoryId" | "search", value: string | null) {
      this.filters[key] = value as never
      if (key === "ownership") this.items = []
      void this.load()
    },

    setSorting(value: string) {
      this.filters.sorting = value
      void this.refresh()
    },

    resetFilters() {
      this.filters.categoryId = null
      this.filters.search = ""
      void this.load()
    },

    onCopyCreated() {
      this.showToast("Личная копия создана")
      void this.refresh()
    },

    showToast(message: string) {
      this.toast = message
      setTimeout(() => {
        if (this.toast === message) this.toast = null
      }, 3000)
    },
  },
})
