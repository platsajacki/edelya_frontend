<template>
  <div ref="pageRef" class="page-layout recipes-page">
    <!-- Header -->
    <div class="recipes-header">
      <h1 class="recipes-header__title">Рецепты</h1>
      <SortButton
        v-if="isIngredientsMode || !store.isAIDraftsTab"
        :label="activeSortStore.sortLabel"
        aria-label="Сортировка"
        :aria-expanded="showSortMenu"
        @click="showSortMenu = !showSortMenu"
      />
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
          :class="{ 'sort-dropdown__item--active': activeSortStore.filters.sorting === opt.value }"
          :aria-pressed="activeSortStore.filters.sorting === opt.value"
          @click="applySorting(opt.value)"
        >
          {{ opt.label }}
        </button>
      </div>
    </Transition>

    <!-- Mode switch -->
    <div class="tabs">
      <button
        v-for="item in MODES"
        :key="item.value"
        class="tabs__item"
        :class="{ 'tabs__item--active': mode === item.value }"
        :aria-pressed="mode === item.value"
        @click="switchMode(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <IngredientsView
      v-if="isIngredientsMode"
      @open-dish="openDishFromIngredient"
      @create="showIngredientForm = true"
    />

    <template v-else>
      <!-- Search -->
      <div class="search-field">
        <IconSearch class="search-field__icon" />
        <input
          v-model="searchQuery"
          type="search"
          class="search-field__input"
          :placeholder="searchPlaceholder"
          :aria-label="searchLabel"
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
          :aria-pressed="store.filters.ownership === tab.value"
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
          <span class="recipes-chip__x" aria-hidden="true">&times;</span>
        </button>
      </div>

      <AIRecipeUsageBadge
        v-if="store.isAIDraftsTab"
        :usage="subscription.aiRecipeUsage"
        :limit="subscription.aiRecipeLimit"
      />

      <CategoryChips
        v-if="!store.isAIDraftsTab"
        :categories="store.categories"
        :model-value="store.filters.categoryId"
        @update:model-value="(value) => store.setFilter('categoryId', value)"
      />

      <!-- Initial loading -->
      <div v-if="store.initialLoading && !activeItemsCount" class="list-loading">
        <div class="spinner" role="status" aria-label="Загрузка" />
      </div>

      <!-- Initial error -->
      <div v-else-if="store.initialError && !activeItemsCount" class="list-error">
        <p class="list-error__text">Не удалось загрузить. Проверьте интернет.</p>
        <button class="list-retry" @click="store.loadCurrent()">Повторить</button>
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
      <div v-else-if="store.isAIDraftsTab" class="list">
        <div v-if="store.refreshing || store.initialLoading" class="list-refreshing">
          <div class="spinner spinner--sm" role="status" aria-label="Загрузка" />
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

      <!-- Dish list -->
      <div v-else class="list">
        <!-- Refreshing indicator -->
        <div v-if="store.refreshing || store.initialLoading" class="list-refreshing">
          <div class="spinner spinner--sm" role="status" aria-label="Загрузка" />
        </div>

        <RecipeDishCard
          v-for="dish in store.dishes"
          :key="dish.id"
          :dish="dish"
          @tap="openDetail"
        />

        <!-- Load more error -->
        <div v-if="store.loadMoreError" class="list-load-more-error">
          <span class="list-load-more-error__text">Не удалось загрузить. Проверьте интернет.</span>
          <button class="list-retry" @click="store.loadMore()">Повторить</button>
        </div>

        <!-- Infinite scroll sentinel -->
        <div ref="sentinelRef" class="list-sentinel">
          <div
            v-if="store.loadingMore"
            class="spinner spinner--sm"
            role="status"
            aria-label="Загрузка"
          />
        </div>
      </div>
    </template>

    <!-- FAB: create new dish or ingredient -->
    <FabButton :aria-label="fabLabel" @click="onFabClick">
      <IconPlus />
    </FabButton>

    <!-- Dish detail bottom-sheet -->
    <RecipeDishDetail
      v-model="showDetail"
      :dish="detailDish"
      @deleted="onDishDeleted"
      @updated="onDishUpdated"
      @cooking-created="onCookingCreated"
    />

    <!-- Create dish form -->
    <DishForm v-model="showCreateForm" @created="onDishCreated" />

    <IngredientForm v-model="showIngredientForm" @created="ingredientsStore.onCreated()" />

    <DishForm
      v-model="showDishEditForm"
      :edit-dish="dishToEdit"
      :highlight-ingredient-id="highlightedIngredientId"
      @updated="onDishUpdated"
    />

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
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from "vue"
import type { DTODish } from "@/types/dish"
import { useRecipesStore } from "../store/recipes"
import { useIngredientsStore } from "../store/ingredients"
import { useSubscriptionStore } from "../store/subscription"
import { SORT_OPTIONS } from "../utils/sortOptions"
import SortButton from "../components/SortButton.vue"
import IngredientsView from "../components/ingredients/IngredientsView.vue"
import RecipeDishCard from "../components/RecipeDishCard.vue"
import CategoryChips from "../components/CategoryChips.vue"
import RecipeDishDetail from "../components/RecipeDishDetail.vue"
import DishForm from "../components/forms/DishForm.vue"
import IngredientForm from "../components/forms/IngredientForm.vue"
import AIDishDraftForm from "../components/forms/AIDishDraftForm.vue"
import AIRecipeUsageBadge from "../components/AIRecipeUsageBadge.vue"
import IconSearch from "../components/icons/IconSearch.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"
import { formatDateRuShort } from "../utils/formatDate"
import { fetchDish } from "../services/dishService"
import { analytics } from "../services/analytics"
import { AnalyticsEvent } from "../constants/analyticsEvents"

defineOptions({ name: "RecipesPage" })

const store = useRecipesStore()
const ingredientsStore = useIngredientsStore()
const subscription = useSubscriptionStore()
const AI_LIMIT_EXCEEDED_MESSAGE = "Лимит AI-рецептов на текущий период исчерпан."

// --- Mode switch ---
type Mode = "recipes" | "ingredients"

const MODES: { value: Mode; label: string }[] = [
  { value: "recipes", label: "Рецепты" },
  { value: "ingredients", label: "Ингредиенты" },
]

const pageRef = ref<HTMLElement | null>(null)
const mode = ref<Mode>("recipes")
const scrollByMode: Record<Mode, number> = { recipes: 0, ingredients: 0 }

const isIngredientsMode = computed(() => mode.value === "ingredients")
const activeSortStore = computed(() => (isIngredientsMode.value ? ingredientsStore : store))

function scrollContainer(): HTMLElement | null {
  return pageRef.value?.closest(".app-shell__content") ?? null
}

async function switchMode(value: Mode) {
  if (value === mode.value) return
  scrollByMode[mode.value] = scrollContainer()?.scrollTop ?? 0
  showSortMenu.value = false
  mode.value = value
  await nextTick()
  scrollContainer()?.scrollTo({ top: scrollByMode[value] })
}

// --- Ownership tabs ---
const tabs = computed(() => [
  { value: "own", label: "Личные" },
  { value: "global", label: "Общие" },
  ...(subscription.canCreateAIRecipes ? [{ value: "ai", label: "AI-запросы" }] : []),
])

const searchLabel = computed(() => (store.isAIDraftsTab ? "Поиск AI-рецептов" : "Поиск блюд"))
const searchPlaceholder = computed(() => `${searchLabel.value}…`)

const activeItemsCount = computed(() =>
  store.isAIDraftsTab ? store.aiDrafts.length : store.dishes.length
)

const emptyText = computed(() => {
  if (store.isAIDraftsTab) return "AI-рецептов пока нет"
  return store.filters.ownership === "own" ? "У вас пока нет личных блюд" : "Общих блюд пока нет"
})

const fabLabel = computed(() => {
  if (isIngredientsMode.value) return "Создать ингредиент"
  return store.isAIDraftsTab ? "Создать с ИИ" : "Создать блюдо"
})

function switchTab(value) {
  showSortMenu.value = false
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

function applySorting(value: string) {
  showSortMenu.value = false
  activeSortStore.value.setSorting(value)
}

// --- Filter chips ---
const activeChips = computed(() => {
  if (store.isAIDraftsTab || !store.hasNonDefaultSort) return []
  return [{ key: "sorting", label: store.sortLabel }]
})

function removeChip(key) {
  if (key === "sorting") store.setSorting("-created_at")
}

function resetAll() {
  searchQuery.value = ""
  store.resetFilters()
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

function onCookingCreated(cookingDate: string) {
  store.showToast(`Готовка на ${formatDateRuShort(cookingDate)} добавлена`)
}

// --- Create ---
const showCreateForm = ref(false)
const showIngredientForm = ref(false)
const showDishEditForm = ref(false)
const dishToEdit = ref<DTODish | null>(null)
const highlightedIngredientId = ref("")

async function openDishFromIngredient(target: { dishId: string; ingredientId: string }) {
  try {
    dishToEdit.value = await fetchDish(target.dishId)
    highlightedIngredientId.value = target.ingredientId
    showDishEditForm.value = true
  } catch {
    store.showToast("Не удалось открыть блюдо")
  }
}
const showAIForm = ref(false)
const selectedAIDraft = ref(null)

function openAICreate() {
  if (subscription.isAIRecipeLimitExceeded) {
    store.showToast(AI_LIMIT_EXCEEDED_MESSAGE)
    analytics.track(AnalyticsEvent.APP_AI_LIMIT_REACHED)
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
  if (isIngredientsMode.value) {
    showIngredientForm.value = true
    return
  }
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
@use "../styles/list-states";

.recipes-page {
  padding: var(--page-padding-top) 16px 72px;

  @media (min-width: 600px) {
    padding: var(--page-padding-top-lg) 24px 72px;
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
    outline-offset: -2px;

    &:active {
      background: var(--color-empty);
    }

    &--active {
      color: var(--color-mint-dark);
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
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-empty);
  font-size: var(--font-xs);
  font-weight: 500;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);

  @media (hover: hover) {
    &:hover {
      background: var(--color-border);
    }
  }

  &__x {
    font-size: 14px;
    line-height: 1;
    color: var(--color-text-secondary);
  }
}

.ai-draft-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
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
      color: var(--color-mint-dark);
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
      color: var(--color-success-dark);
    }
  }
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
