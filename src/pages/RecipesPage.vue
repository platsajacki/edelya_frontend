<template>
  <div class="page-layout recipes-page">
    <!-- Header -->
    <div class="recipes-header">
      <h1 class="recipes-header__title">Рецепты</h1>
      <div class="recipes-header__actions">
        <button
          v-if="!store.isAIDraftsTab"
          class="recipes-header__action-btn"
          aria-label="Сортировка"
          @click="showSortMenu = !showSortMenu"
        >
          <IconSort />
        </button>
        <button
          v-if="!store.isAIDraftsTab"
          class="recipes-header__action-btn"
          :class="{ 'recipes-header__action-btn--active': store.hasActiveFilters }"
          aria-label="Фильтры"
          @click="showFilters = true"
        >
          <IconFilter />
          <span v-if="store.hasActiveFilters" class="recipes-header__filter-dot" />
        </button>
      </div>
    </div>

    <!-- Sort dropdown overlay -->
    <div v-if="showSortMenu" class="sort-dropdown-overlay" @click="showSortMenu = false" />

    <!-- Sort dropdown -->
    <Transition name="dropdown">
      <div v-if="showSortMenu" class="sort-dropdown">
        <button
          v-for="opt in SORT_OPTIONS"
          :key="opt.value"
          class="sort-dropdown__item"
          :class="{ 'sort-dropdown__item--active': store.filters.sorting === opt.value }"
          @click="applySorting(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </Transition>

    <!-- Search -->
    <div class="search-field">
      <IconSearch class="search-field__icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="search-field__input"
        :placeholder="searchPlaceholder"
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

    <!-- Ownership tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tabs__item"
        :class="{ 'tabs__item--active': store.filters.ownership === tab.value }"
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

    <AIRecipeUsageBadge
      v-if="store.isAIDraftsTab"
      :usage="subscription.aiRecipeUsage"
      :limit="subscription.aiRecipeLimit"
    />

    <!-- Initial loading -->
    <div v-if="store.initialLoading && !activeItemsCount" class="recipes-loading">
      <div class="spinner" />
    </div>

    <!-- Initial error -->
    <div v-else-if="store.initialError && !activeItemsCount" class="recipes-error">
      <p class="recipes-error__text">Не удалось загрузить. Проверьте интернет.</p>
      <button class="recipes-error__retry" @click="store.loadCurrent()">Повторить</button>
    </div>

    <!-- Empty state -->
    <div v-else-if="!activeItemsCount" class="empty-state">
      <p class="empty-state__text">
        {{ emptyText }}
      </p>
      <button v-if="store.isAIDraftsTab" class="empty-state__action" @click="openAICreate()">
        Создать с ИИ
      </button>
      <button
        v-if="store.filters.ownership === 'own'"
        class="empty-state__action"
        @click="showCreateForm = true"
      >
        Добавить первое блюдо
      </button>
      <button
        v-if="store.hasActiveFilters || store.hasNonDefaultSort"
        class="empty-state__secondary"
        @click="resetAll"
      >
        Сбросить фильтры
      </button>
    </div>

    <!-- AI drafts list -->
    <div v-else-if="store.isAIDraftsTab" class="recipes-list">
      <div v-if="store.refreshing" class="recipes-refreshing">
        <div class="spinner spinner--sm" />
      </div>

      <button
        v-for="draft in store.aiDrafts"
        :key="draft.id"
        type="button"
        class="ai-draft-card"
        @click="openAIDraft(draft)"
      >
        <span class="ai-draft-card__title">{{ draftTitle(draft) }}</span>
        <span class="ai-draft-card__meta">
          <span class="ai-draft-card__status" :class="`ai-draft-card__status--${draft.status}`">
            {{ draftStatusLabel(draft.status) }}
          </span>
          <span>{{ formatDraftDate(draft.updated_at || draft.created_at) }}</span>
        </span>
      </button>

      <div v-if="store.loadMoreError" class="recipes-load-more-error">
        <span class="recipes-load-more-error__text">Не удалось загрузить. Проверьте интернет.</span>
        <button class="recipes-load-more-error__retry" @click="store.loadMore()">Повторить</button>
      </div>

      <div ref="sentinelRef" class="recipes-sentinel">
        <div v-if="store.loadingMore" class="spinner spinner--sm" />
      </div>
    </div>

    <!-- Dish list -->
    <div v-else class="recipes-list">
      <!-- Refreshing indicator -->
      <div v-if="store.refreshing" class="recipes-refreshing">
        <div class="spinner spinner--sm" />
      </div>

      <RecipeDishCard v-for="dish in store.dishes" :key="dish.id" :dish="dish" @tap="openDetail" />

      <!-- Load more error -->
      <div v-if="store.loadMoreError" class="recipes-load-more-error">
        <span class="recipes-load-more-error__text">Не удалось загрузить. Проверьте интернет.</span>
        <button class="recipes-load-more-error__retry" @click="store.loadMore()">Повторить</button>
      </div>

      <!-- Infinite scroll sentinel -->
      <div ref="sentinelRef" class="recipes-sentinel">
        <div v-if="store.loadingMore" class="spinner spinner--sm" />
      </div>
    </div>

    <!-- FAB: create new dish -->
    <FabButton :aria-label="fabLabel" @click="onFabClick">
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
    <DishForm v-model="showCreateForm" @created="onDishCreated" />

    <AIDishDraftForm
      v-model="showAIForm"
      :draft-to-open="selectedAIDraft"
      @created="onDishCreated"
      @draft-created="onAIDraftCreated"
      @draft-updated="onAIDraftUpdated"
      @open-dish="onOpenDish"
    />

    <!-- Toast -->
    <Toast :message="store.toast" @dismiss="store.toast = null" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue"
import type { DTODish } from "@/types/dish"
import { useRecipesStore, SORT_OPTIONS } from "../store/recipes"
import { useSubscriptionStore } from "../store/subscription"
import RecipeDishCard from "../components/RecipeDishCard.vue"
import RecipeFilterPanel from "../components/RecipeFilterPanel.vue"
import RecipeDishDetail from "../components/RecipeDishDetail.vue"
import DishForm from "../components/forms/DishForm.vue"
import AIDishDraftForm from "../components/forms/AIDishDraftForm.vue"
import AIRecipeUsageBadge from "../components/AIRecipeUsageBadge.vue"
import IconFilter from "../components/icons/IconFilter.vue"
import IconSearch from "../components/icons/IconSearch.vue"
import IconSort from "../components/icons/IconSort.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"

defineOptions({ name: "RecipesPage" })

const store = useRecipesStore()
const subscription = useSubscriptionStore()
const AI_LIMIT_EXCEEDED_MESSAGE = "Лимит AI-рецептов на текущий период исчерпан."

// --- Ownership tabs ---
const tabs = computed(() => [
  { value: "own", label: "Личные" },
  { value: "global", label: "Общие" },
  ...(subscription.canCreateAIRecipes ? [{ value: "ai", label: "AI-запросы" }] : []),
])

const searchPlaceholder = computed(() =>
  store.isAIDraftsTab ? "Поиск AI-рецептов..." : "Поиск блюд..."
)

const activeItemsCount = computed(() =>
  store.isAIDraftsTab ? store.aiDrafts.length : store.dishes.length
)

const emptyText = computed(() => {
  if (store.isAIDraftsTab) return "AI-рецептов пока нет"
  return store.filters.ownership === "own" ? "У вас пока нет личных блюд" : "Общих блюд пока нет"
})

const fabLabel = computed(() => (store.isAIDraftsTab ? "Создать с ИИ" : "Создать блюдо"))

function switchTab(value) {
  showSortMenu.value = false
  showFilters.value = false
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

// --- Sorting ---
const showSortMenu = ref(false)

function applySorting(value) {
  showSortMenu.value = false
  store.setSorting(value)
}

// --- Filter chips ---
const activeChips = computed(() => {
  if (store.isAIDraftsTab) return []
  const chips = []
  if (store.filters.categoryId) {
    const cat = store.categories.find((c) => c.id === store.filters.categoryId)
    chips.push({ key: "category", label: cat?.name || "Категория" })
  }
  if (store.hasNonDefaultSort) {
    chips.push({ key: "sorting", label: store.sortLabel })
  }
  return chips
})

function removeChip(key) {
  if (key === "category") store.setFilter("categoryId", null)
  if (key === "sorting") store.setSorting("-created_at")
}

function resetAll() {
  searchQuery.value = ""
  store.resetFilters()
}

// --- Filters panel ---
const showFilters = ref(false)

function onApplyFilters({ categoryId }) {
  store.setFilter("categoryId", categoryId)
}

// --- Detail ---
const showDetail = ref(false)
const detailDish = ref<DTODish | null>(null)

function openDetail(dish: DTODish) {
  detailDish.value = dish
  showDetail.value = true
}

function onDishDeleted(id) {
  store.removeDish(id)
}

function onDishUpdated() {
  store.onDishUpdated()
}

// --- Create ---
const showCreateForm = ref(false)
const showAIForm = ref(false)
const selectedAIDraft = ref(null)

function openAICreate() {
  if (subscription.isAIRecipeLimitExceeded) {
    store.showToast(AI_LIMIT_EXCEEDED_MESSAGE)
    return
  }
  selectedAIDraft.value = null
  showAIForm.value = true
}

function openAIDraft(draft) {
  selectedAIDraft.value = draft
  showAIForm.value = true
}

function onFabClick() {
  if (store.isAIDraftsTab) {
    openAICreate()
    return
  }
  showCreateForm.value = true
}

function onDishCreated() {
  if (store.isAIDraftsTab) {
    store.showToast("Блюдо создано")
    return
  }
  store.onDishCreated()
}

function onAIDraftCreated(draft) {
  store.onAIDraftCreated(draft)
  subscription.loadAIRecipeUsage().catch(() => {})
}

function onAIDraftUpdated(draft) {
  store.upsertAIDraft(draft)
}

function onOpenDish(dish: DTODish) {
  detailDish.value = dish
  showDetail.value = true
}

function draftTitle(draft) {
  return draft.payload?.name || draft.source_text?.trim().split("\n")[0] || "AI-рецепт"
}

function draftStatusLabel(status) {
  return (
    {
      processing: "Разбор",
      parsed: "Ожидает создания",
      failed: "Ошибка",
      dish_created: "Создано",
    }[status] || status
  )
}

function formatDraftDate(value) {
  if (!value) return ""
  return new Date(value).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })
}

// --- Infinite scroll ---
const sentinelRef = ref(null)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0]?.isIntersecting &&
        store.hasMore &&
        !store.initialLoading &&
        !store.loadingMore
      ) {
        store.loadMore()
      }
    },
    { rootMargin: "200px" }
  )

  // Load data only on first mount (KeepAlive preserves state on revisit)
  if (!store.dishes.length && !store.initialLoading) {
    store.loadCategories()
    store.loadCurrent()
  }
})

let aiPollTimer = null

watch(
  () => store.isAIDraftsTab,
  (isAIDraftsTab) => {
    clearInterval(aiPollTimer)
    aiPollTimer = null
    if (!isAIDraftsTab) return
    store.loadAIDrafts()
    subscription.loadSubscriptionDictionary().catch(() => {})
    subscription.loadAIRecipeUsage().catch(() => {})
    aiPollTimer = setInterval(() => {
      store.refreshProcessingAIDrafts()
    }, 7000)
  },
  { immediate: true }
)

watch(
  () => subscription.canCreateAIRecipes,
  (canCreateAIRecipes) => {
    if (!canCreateAIRecipes && store.isAIDraftsTab) store.setFilter("ownership", "own")
  }
)

watch(
  sentinelRef,
  (el) => {
    if (el && observer) observer.observe(el)
  },
  { flush: "post" }
)

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(searchTimer)
  clearInterval(aiPollTimer)
})
</script>

<style lang="scss" scoped>
.recipes-page {
  padding: var(--page-padding-top) 16px calc(var(--nav-height) + 72px);

  @media (min-width: 600px) {
    padding: var(--page-padding-top-lg) 24px 88px;
  }
}

.recipes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 6px;
  }

  &__action-btn {
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
    transition: background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-border);
    }

    &--active {
      border-color: var(--color-mint);
      color: var(--color-mint);
    }
  }

  &__filter-dot {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-mint);
  }
}

.sort-dropdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 10;
}

.sort-dropdown {
  position: relative;
  z-index: 11;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;

  &__item {
    padding: 10px 14px;
    border: none;
    background: none;
    text-align: left;
    font-size: var(--font-sm);
    color: var(--color-text);
    cursor: pointer;
    transition: background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-empty);
    }

    &--active {
      color: var(--color-mint);
      font-weight: 600;
      background: var(--color-mint-alpha-08);
    }

    & + & {
      border-top: 1px solid var(--color-border);
    }
  }
}

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
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-border);
  }

  &__x {
    font-size: 14px;
    line-height: 1;
    color: var(--color-text-secondary);
  }
}

.recipes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.recipes-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  text-align: center;

  &__text {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin: 0;
  }

  &__retry {
    padding: 8px 20px;
    border: 1px solid var(--color-mint);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-mint);
    font-size: var(--font-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:active {
      background: var(--color-mint-alpha-08);
    }
  }
}

.recipes-refreshing {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

.recipes-load-more-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px 0;

  &__text {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__retry {
    padding: 4px 12px;
    border: 1px solid var(--color-mint);
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-mint);
    font-size: var(--font-xs);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:active {
      background: var(--color-mint-alpha-08);
    }
  }
}

.recipes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-draft-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  text-align: left;
  box-shadow: var(--shadow-card);
  transition:
    background var(--transition-fast),
    transform var(--transition-fast);

  &:active {
    transform: scale(var(--press-scale-sm));
    background: var(--color-empty);
  }

  &__title {
    width: 100%;
    font-size: var(--font-md);
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__status {
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    background: var(--color-empty);
    color: var(--color-text-secondary);
    font-weight: 600;

    &--processing {
      background: var(--color-mint-alpha-10);
      color: var(--color-mint);
    }

    &--parsed {
      background: var(--color-info-bg);
      color: var(--color-info);
    }

    &--failed {
      background: var(--color-danger-pale);
      color: var(--color-danger);
    }

    &--dish_created {
      background: var(--color-success-bg);
      color: var(--color-success);
    }
  }
}

.recipes-sentinel {
  display: flex;
  justify-content: center;
  padding: 12px 0;
  min-height: 1px;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}
</style>
