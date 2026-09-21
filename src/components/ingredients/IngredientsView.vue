<template>
  <div class="ingredients-view">
    <div class="search-field">
      <IconSearch class="search-field__icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="search-field__input"
        placeholder="Поиск ингредиента…"
        aria-label="Поиск ингредиента"
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        class="search-field__clear"
        aria-label="Очистить"
        @click="clearSearch"
      >
        &times;
      </button>
    </div>

    <div class="tabs">
      <button
        v-for="tab in TABS"
        :key="tab.value"
        class="tabs__item"
        :class="{ 'tabs__item--active': store.filters.ownership === tab.value }"
        :aria-pressed="store.filters.ownership === tab.value"
        @click="store.setFilter('ownership', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <CategoryChips
      :categories="store.categories"
      :model-value="store.filters.categoryId"
      @update:model-value="(value) => store.setFilter('categoryId', value)"
    />

    <div v-if="store.initialLoading && !store.items.length" class="list-loading">
      <div class="spinner" role="status" aria-label="Загрузка" />
    </div>

    <div v-else-if="store.initialError && !store.items.length" class="list-error">
      <p class="list-error__text">Не удалось загрузить. Проверьте интернет.</p>
      <button class="list-retry" @click="store.load()">Повторить</button>
    </div>

    <div v-else-if="!store.items.length" class="empty-state">
      <p class="empty-state__text">{{ emptyText }}</p>
      <button
        v-if="store.filters.ownership === 'own'"
        class="empty-state__action"
        @click="emit('create')"
      >
        Добавить первый ингредиент
      </button>
      <button
        v-if="store.hasActiveFilters || store.hasNonDefaultSort"
        class="empty-state__secondary"
        @click="resetAll"
      >
        Сбросить фильтры
      </button>
    </div>

    <div v-else class="list">
      <div v-if="store.refreshing || store.initialLoading" class="list-refreshing">
        <div class="spinner spinner--sm" role="status" aria-label="Загрузка" />
      </div>

      <IngredientCard
        v-for="item in store.items"
        :key="item.id"
        :ingredient="item"
        @tap="openDetail"
      />

      <div v-if="store.loadMoreError" class="list-load-more-error">
        <span class="list-load-more-error__text">Не удалось загрузить. Проверьте интернет.</span>
        <button class="list-retry" @click="store.loadMore()">Повторить</button>
      </div>

      <div ref="sentinelRef" class="list-sentinel">
        <div
          v-if="store.loadingMore"
          class="spinner spinner--sm"
          role="status"
          aria-label="Загрузка"
        />
      </div>
    </div>

    <IngredientDetail
      v-if="detailIngredient"
      v-model="showDetail"
      :ingredient="detailIngredient"
      @open-dish="(target) => emit('open-dish', target)"
    />

    <Toast :message="store.toast" @dismiss="store.toast = null" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useIngredientsStore } from "../../store/ingredients"
import CategoryChips from "../CategoryChips.vue"
import IngredientCard from "./IngredientCard.vue"
import IngredientDetail from "./IngredientDetail.vue"
import type { DTOIngredient } from "@/types/ingredient"
import IconSearch from "../icons/IconSearch.vue"
import Toast from "../Toast.vue"

const TABS = [
  { value: "own", label: "Личные" },
  { value: "global", label: "Общие" },
] as const

const emit = defineEmits<{
  (e: "open-dish", target: { dishId: string; ingredientId: string }): void
  (e: "create"): void
}>()

const store = useIngredientsStore()

const emptyText = computed(() =>
  store.filters.ownership === "own"
    ? "У вас пока нет личных ингредиентов"
    : "Общих ингредиентов пока нет"
)

const searchQuery = ref(store.filters.search)
let searchTimer: ReturnType<typeof setTimeout> | undefined

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.setFilter("search", searchQuery.value), 350)
}

function clearSearch() {
  searchQuery.value = ""
  store.setFilter("search", "")
}

function resetAll() {
  searchQuery.value = ""
  store.resetFilters()
}

const showDetail = ref(false)
const detailIngredient = ref<DTOIngredient | null>(null)

function openDetail(ingredient: DTOIngredient) {
  detailIngredient.value = ingredient
  showDetail.value = true
}

const sentinelRef = ref<HTMLElement | null>(null)

const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0]?.isIntersecting) store.loadMore()
  },
  { rootMargin: "200px" }
)

watch(
  sentinelRef,
  (el, prev) => {
    if (prev) observer.unobserve(prev)
    if (el) observer.observe(el)
  },
  { flush: "post" }
)

onMounted(() => {
  if (store.items.length || store.initialLoading) return
  store.loadCategories()
  store.load()
})

onUnmounted(() => {
  observer.disconnect()
  clearTimeout(searchTimer)
})
</script>

<style lang="scss" scoped>
@use "../../styles/list-states";

.ingredients-view {
  display: contents;
}
</style>
