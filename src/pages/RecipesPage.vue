<template>
  <div class="page-layout recipes-page">
    <!-- Header -->
    <div class="recipes-header">
      <h1 class="recipes-header__title">Рецепты</h1>
      <button class="recipes-header__filter-btn" @click="showFilters = true" aria-label="Фильтры">
        <IconFilter />
        <span v-if="store.hasActiveFilters" class="recipes-header__filter-dot" />
      </button>
    </div>

    <!-- Search -->
    <div class="recipes-search">
      <IconSearch class="recipes-search__icon" />
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
      <div class="spinner" />
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
        <div v-if="store.loadingMore" class="spinner spinner--sm" />
      </div>
    </div>

    <!-- FAB: create new dish -->
    <FabButton @click="showCreateForm = true" aria-label="Создать блюдо">
      <IconPlus />
    </FabButton>

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
    <Toast :message="store.toast" @dismiss="store.toast = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import { useRecipesStore } from "../store/recipes"
import RecipeDishCard from "../components/RecipeDishCard.vue"
import RecipeFilterPanel from "../components/RecipeFilterPanel.vue"
import RecipeDishDetail from "../components/RecipeDishDetail.vue"
import DishForm from "../components/forms/DishForm.vue"
import IconFilter from "../components/icons/IconFilter.vue"
import IconSearch from "../components/icons/IconSearch.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"

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
  padding: 12px 16px calc(var(--nav-height) + 72px);
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
  border-radius: var(--radius-lg);
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
  border-radius: var(--radius-xs);
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
  box-shadow: var(--shadow-tab);
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

@media (min-width: 600px) {
  .recipes-page {
    padding: 16px 24px 88px;
  }
}
</style>
