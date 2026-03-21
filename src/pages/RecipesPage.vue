<template>
  <div class="recipes-page">
    <!-- Header -->
    <div class="recipes-header">
      <h1 class="recipes-header__title">Рецепты</h1>
      <button class="recipes-header__filter-btn" @click="showFilters = true" aria-label="Фильтры">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 4h16M5 10h10M7 16h6"/>
        </svg>
        <span v-if="store.hasActiveFilters" class="recipes-header__filter-dot" />
      </button>
    </div>

    <!-- Search -->
    <div class="recipes-search">
      <svg class="recipes-search__icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="7" cy="7" r="4.5"/>
        <path d="M10.5 10.5L14 14"/>
      </svg>
      <input
        v-model="searchQuery"
        type="text"
        class="recipes-search__input"
        placeholder="Поиск блюда..."
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        class="recipes-search__clear"
        @click="clearSearch"
        aria-label="Очистить"
      >
        &times;
      </button>
    </div>

    <!-- Ownership tabs -->
    <div class="recipes-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="recipes-tabs__item"
        :class="{ 'recipes-tabs__item--active': activeTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Active filter chips -->
    <div v-if="activeChips.length" class="recipes-chips">
      <button
        v-for="chip in activeChips"
        :key="chip.key"
        class="recipes-chip"
        @click="removeChip(chip.key)"
      >
        {{ chip.label }}
        <span class="recipes-chip__x">&times;</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="recipes-loading">
      <div class="recipes-spinner" />
      <span>Загрузка...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.activeDishes.length" class="recipes-empty">
      <p class="recipes-empty__text">
        {{ activeTab === 'own' ? 'У вас пока нет личных блюд' : activeTab === 'global' ? 'Общих блюд не найдено' : 'Блюда не найдены' }}
      </p>
      <button v-if="activeTab === 'own'" class="recipes-empty__add" @click="showCreateForm = true">
        + Добавить блюдо
      </button>
      <button v-if="store.hasActiveFilters" class="recipes-empty__reset" @click="store.resetFilters(); searchQuery = ''">
        Сбросить фильтры
      </button>
    </div>

    <!-- Flat dish list -->
    <div v-else class="recipes-list">
      <RecipeDishCard
        v-for="dish in store.activeDishes"
        :key="dish.id"
        :dish="dish"
        @tap="openDetail"
      />

      <!-- Infinite scroll sentinel -->
      <div ref="sentinelRef" class="recipes-sentinel">
        <div v-if="store.loadingMore" class="recipes-spinner recipes-spinner--sm" />
      </div>
    </div>

    <!-- FAB: create new dish -->
    <button class="recipes-fab" @click="showCreateForm = true" aria-label="Создать блюдо">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- Filter panel -->
    <RecipeFilterPanel
      v-model="showFilters"
      :categories="store.categories"
      :current-category-id="store.filters.categoryId"
      @apply="onApplyFilters"
    />

    <!-- Dish detail bottom-sheet -->
    <RecipeDishDetail
      v-model="showDetail"
      :dish="detailDish"
      @deleted="onDishDeleted"
      @updated="onDishUpdated"
    />

    <!-- Create dish form -->
    <DishForm
      v-model="showCreateForm"
      @created="onDishCreated"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="store.toast" class="recipes-toast" @click="store.toast = null">
        {{ store.toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useRecipesStore } from "../store/recipes"
import RecipeDishCard from "../components/RecipeDishCard.vue"
import RecipeFilterPanel from "../components/RecipeFilterPanel.vue"
import RecipeDishDetail from "../components/RecipeDishDetail.vue"
import DishForm from "../components/forms/DishForm.vue"

const store = useRecipesStore()

// --- Ownership tabs ---
const tabs = [
  { value: "own", label: "Личные" },
  { value: "global", label: "Общие" },
]

const activeTab = ref("own")

function switchTab(value) {
  activeTab.value = value
  store.setFilter("ownership", value)
}

// --- Search ---
const searchQuery = ref(store.filters.search)
let searchTimer = null

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    store.setFilter("search", searchQuery.value)
  }, 350)
}

function clearSearch() {
  searchQuery.value = ""
  store.setFilter("search", "")
}

// --- Filter chips ---
const activeChips = computed(() => {
  const chips = []
  if (store.filters.categoryId) {
    const cat = store.categories.find((c) => c.id === store.filters.categoryId)
    chips.push({ key: "category", label: cat?.name || "Категория" })
  }
  return chips
})

function removeChip(key) {
  if (key === "category") store.setFilter("categoryId", null)
}

// --- Filters panel ---
const showFilters = ref(false)

function onApplyFilters({ categoryId }) {
  store.filters.categoryId = categoryId
  store.loadDishes()
}

// --- Detail ---
const showDetail = ref(false)
const detailDish = ref({})

function openDetail(dish) {
  detailDish.value = dish
  showDetail.value = true
}

function onDishDeleted(id) {
  store.removeDish(id)
}

function onDishUpdated() {
  store.loadDishes()
}

// --- Create ---
const showCreateForm = ref(false)

function onDishCreated() {
  store.onDishCreated()
}

// --- Infinite scroll ---
const sentinelRef = ref(null)
let observer = null

onMounted(() => {
  store.loadCategories()
  store.filters.ownership = "own"
  store.loadDishes()

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting && store.hasMore && !store.loading) {
        store.loadMore()
      }
    },
    { rootMargin: "200px" }
  )
})

watch(sentinelRef, (el) => {
  if (el && observer) observer.observe(el)
}, { flush: "post" })

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(searchTimer)
})
</script>

<style scoped>
.recipes-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 80px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Header */
.recipes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.recipes-header__title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.recipes-header__filter-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.recipes-header__filter-btn:active {
  background: var(--color-border);
}

.recipes-header__filter-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-mint);
}

/* Search */
.recipes-search {
  position: relative;
  display: flex;
  align-items: center;
}

.recipes-search__icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.recipes-search__input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s;
}

.recipes-search__input:focus {
  border-color: var(--color-mint);
}

.recipes-search__input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.recipes-search__clear {
  position: absolute;
  right: 4px;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.12s;
}

.recipes-search__clear:hover {
  background: var(--color-empty);
}

/* Filter chips */
.recipes-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.recipes-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-empty);
  font-size: var(--font-xs);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.12s;
}

.recipes-chip:hover {
  background: var(--color-border);
}

.recipes-chip__x {
  font-size: 14px;
  line-height: 1;
  color: var(--color-text-secondary);
}

/* Loading */
.recipes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.recipes-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-mint);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.recipes-spinner--sm {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty */
.recipes-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  text-align: center;
}

.recipes-empty__text {
  font-size: var(--font-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.recipes-empty__reset {
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-empty);
  color: var(--color-mint);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.recipes-empty__reset:hover {
  background: var(--color-border);
}

.recipes-empty__add {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: var(--font-md);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.recipes-empty__add:hover {
  background: var(--color-mint-hover);
}

/* Tabs */
.recipes-tabs {
  display: flex;
  gap: 0;
  background: var(--color-empty);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.recipes-tabs__item {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.recipes-tabs__item--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* Sections & list */
.recipes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recipes-sentinel {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  min-height: 1px;
}

/* FAB */
.recipes-fab {
  position: fixed;
  bottom: calc(64px + env(safe-area-inset-bottom, 0px));
  right: max(16px, calc((100vw - 480px) / 2 + 16px));
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: var(--color-mint);
  color: var(--on-primary);
  box-shadow: var(--shadow-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 800;
  transition: background 0.15s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.recipes-fab:hover {
  background: var(--color-mint-hover);
}

.recipes-fab:active {
  transform: scale(0.93);
}

/* Toast */
.recipes-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  background: var(--color-text);
  color: var(--color-surface);
  border-radius: var(--radius-sm);
  font-size: 13px;
  box-shadow: var(--shadow-elevated);
  cursor: pointer;
  z-index: 99999;
  max-width: calc(100vw - 32px);
  text-align: center;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

@media (min-width: 600px) {
  .recipes-page {
    max-width: 540px;
    padding: 16px 24px 88px;
  }
}
</style>
