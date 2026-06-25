<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="picker-overlay" :style="{ zIndex }" @click.self="close">
        <div class="picker-panel">
          <!-- Header -->
          <div class="picker-header">
            <h3 class="picker-title">Выбрать блюдо</h3>
            <button class="picker-close" aria-label="Закрыть" @click="close">&times;</button>
          </div>

          <!-- Search -->
          <div class="picker-search">
            <IconSearch class="picker-search__icon" />
            <input
              ref="searchInputEl"
              v-model="query"
              type="search"
              class="picker-search__input"
              placeholder="Поиск рецепта..."
              @input="onQueryInput"
            />
            <button
              v-if="query"
              class="picker-search__clear"
              aria-label="Очистить"
              @click="clearQuery"
            >
              &times;
            </button>
          </div>

          <!-- Tabs -->
          <div class="picker-tabs">
            <button
              v-for="tab in TABS"
              :key="tab.value"
              class="picker-tabs__item"
              :class="{ 'picker-tabs__item--active': ownership === tab.value }"
              @click="switchTab(tab.value)"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Filter chips row -->
          <div class="picker-filter-row">
            <button
              class="picker-filter-btn"
              :class="{ 'picker-filter-btn--active': categoryId !== null }"
              @click="showFilters = true"
            >
              <IconFilter />
              <span>Фильтры</span>
              <span v-if="categoryId !== null" class="picker-filter-btn__dot" />
            </button>
            <button
              v-if="categoryId !== null"
              class="picker-chip"
              @click="
                () => {
                  categoryId = null
                  reload()
                }
              "
            >
              {{ activeCategoryName }} &times;
            </button>
          </div>

          <!-- List -->
          <div ref="listEl" class="picker-body">
            <div v-if="initialLoading && !dishes.length" class="picker-status">
              <div class="spinner" />
            </div>

            <div
              v-else-if="initialError && !dishes.length"
              class="picker-status picker-status--error"
            >
              <p>{{ initialError }}</p>
              <button class="picker-retry" @click="reload">Повторить</button>
            </div>

            <div v-else-if="!dishes.length && !initialLoading" class="picker-status">
              <p class="picker-empty">Рецепты не найдены</p>
            </div>

            <ul v-else class="picker-list">
              <li
                v-for="dish in dishes"
                :key="dish.id"
                class="picker-item"
                @click="openPreview(dish)"
              >
                <div class="picker-item__info">
                  <span class="picker-item__name">{{ dish.name }}</span>
                  <span v-if="dish.category?.name" class="picker-item__category">{{
                    dish.category.name
                  }}</span>
                </div>
                <OwnershipBadge :is-own="isDishOwn(dish)" short />
              </li>
            </ul>

            <!-- Infinite scroll sentinel -->
            <div ref="sentinelEl" class="picker-sentinel">
              <div v-if="loadingMore" class="spinner spinner--sm" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Category filter panel -->
  <RecipeFilterPanel
    v-model="showFilters"
    :categories="categories"
    :current-category-id="categoryId"
    :z-index="zIndex + 10"
    @apply="onApplyFilters"
  />

  <!-- Dish preview sheet -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showPreview"
        class="picker-overlay"
        :style="{ zIndex: zIndex + 20 }"
        @click.self="showPreview = false"
      >
        <div class="picker-panel picker-panel--preview">
          <div class="picker-header">
            <h3 class="picker-title">{{ previewDish?.name }}</h3>
            <button class="picker-close" aria-label="Закрыть" @click="showPreview = false">
              &times;
            </button>
          </div>

          <div class="picker-body picker-preview-body">
            <div v-if="previewLoading" class="picker-status"><div class="spinner" /></div>
            <template v-else-if="previewDish">
              <div class="preview-section">
                <p v-if="previewDish.category?.name" class="preview-meta">
                  {{ previewDish.category.name }}
                </p>
                <OwnershipBadge :is-own="isDishOwn(previewDish)" />
              </div>

              <div v-if="previewDish.dish_ingredients?.length" class="preview-section">
                <span class="preview-label">Состав</span>
                <ul class="preview-ingredients">
                  <li
                    v-for="di in previewDish.dish_ingredients"
                    :key="di.id"
                    class="preview-ingredient"
                  >
                    <span class="preview-ingredient__name">{{ di.ingredient.name }}</span>
                    <span class="preview-ingredient__right">
                      <span v-if="di.is_optional" class="preview-ingredient__opt">опц.</span>
                      <span class="preview-ingredient__amount">{{
                        formatShoppingAmount(di.amount, di.ingredient.base_unit).display
                      }}</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div v-if="previewDish.recipe" class="preview-section">
                <span class="preview-label">Рецепт</span>
                <p class="preview-recipe">{{ previewDish.recipe }}</p>
              </div>
            </template>
          </div>

          <div class="picker-preview-footer">
            <button class="picker-select-btn" @click="selectDish(previewDish)">
              Выбрать этот рецепт
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onUnmounted } from "vue"
import { fetchDishes, fetchDish, fetchDishCategories } from "../services/dishService"
import { isDishOwn } from "../utils/dishOwnership"
import { formatShoppingAmount } from "../utils/formatShoppingAmount"
import OwnershipBadge from "./OwnershipBadge.vue"
import RecipeFilterPanel from "./RecipeFilterPanel.vue"
import IconSearch from "./icons/IconSearch.vue"
import IconFilter from "./icons/IconFilter.vue"
import type { DTODish, DTODishCategory } from "@/types/dish"

const PAGE_SIZE = 20

const TABS = [
  { value: "own", label: "Личные" },
  { value: "global", label: "Общие" },
] as const

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    zIndex?: number
  }>(),
  {
    zIndex: 1100,
  }
)

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void
  (e: "select", dish: DTODish): void
}>()

// --- State ---
const query = ref("")
const ownership = ref<"own" | "global">("own")
const categoryId = ref<number | null>(null)
const dishes = ref<DTODish[]>([])
const categories = ref<DTODishCategory[]>([])
const page = ref(1)
const hasMore = ref(false)
const initialLoading = ref(false)
const loadingMore = ref(false)
const initialError = ref<string | null>(null)
const showFilters = ref(false)
const searchInputEl = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)
const sentinelEl = ref<HTMLElement | null>(null)

// preview
const showPreview = ref(false)
const previewDish = ref<DTODish | null>(null)
const previewLoading = ref(false)

async function openPreview(dish: DTODish) {
  showPreview.value = true
  // Use cached data first, then fetch full if ingredients missing
  previewDish.value = dish
  if (!dish.dish_ingredients) {
    previewLoading.value = true
    try {
      previewDish.value = await fetchDish(dish.id)
    } catch {
      // keep partial data
    } finally {
      previewLoading.value = false
    }
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let observer: IntersectionObserver | null = null
let savedOverflow = ""

const activeCategoryName = computed(() => {
  if (!categoryId.value) return ""
  return categories.value.find((c) => c.id === categoryId.value)?.name ?? ""
})

function buildParams(p = 1): Record<string, unknown> {
  const params: Record<string, unknown> = { page: p, page_size: PAGE_SIZE }
  if (ownership.value === "own") params.only_owned = true
  if (ownership.value === "global") params.only_global = true
  if (categoryId.value) params.category = categoryId.value
  if (query.value.trim()) params.search = query.value.trim()
  return params
}

async function loadFirst() {
  initialLoading.value = true
  initialError.value = null
  dishes.value = []
  page.value = 1
  hasMore.value = false
  try {
    const data = await fetchDishes(buildParams(1))
    dishes.value = data.results ?? []
    hasMore.value = !!data.next
    page.value = 1
  } catch (e) {
    initialError.value = e instanceof Error ? e.message : "Не удалось загрузить рецепты"
  } finally {
    initialLoading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const nextPage = page.value + 1
    const data = await fetchDishes(buildParams(nextPage))
    dishes.value.push(...(data.results ?? []))
    hasMore.value = !!data.next
    page.value = nextPage
  } catch {
    // silent
  } finally {
    loadingMore.value = false
  }
}

function reload() {
  loadFirst()
}

function onQueryInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(reload, 300)
}

function clearQuery() {
  query.value = ""
  reload()
}

function switchTab(value: "own" | "global") {
  ownership.value = value
  reload()
}

function onApplyFilters({ categoryId: catId }: { categoryId: number | null }) {
  categoryId.value = catId
  reload()
}

function selectDish(dish: DTODish) {
  emit("select", dish)
  close()
}

function close() {
  emit("update:modelValue", false)
}

// Body scroll lock
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      query.value = ""
      ownership.value = "own"
      categoryId.value = null
      showFilters.value = false
      if (!categories.value.length) {
        fetchDishCategories()
          .then((data) => {
            categories.value = data.results
          })
          .catch(() => {})
      }
      await loadFirst()
      setupObserver()
    } else {
      document.body.style.overflow = savedOverflow
      destroyObserver()
    }
  }
)

function setupObserver() {
  destroyObserver()
  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0]?.isIntersecting &&
        hasMore.value &&
        !initialLoading.value &&
        !loadingMore.value
      ) {
        loadMore()
      }
    },
    { root: listEl.value, rootMargin: "120px" }
  )
  if (sentinelEl.value) observer.observe(sentinelEl.value)
}

function destroyObserver() {
  observer?.disconnect()
  observer = null
}

// Re-attach observer when sentinel mounts
watch(
  sentinelEl,
  (el) => {
    if (el && props.modelValue) setupObserver()
  },
  { flush: "post" }
)

onUnmounted(() => {
  clearTimeout(debounceTimer)
  destroyObserver()
  document.body.style.overflow = savedOverflow
})
</script>

<style lang="scss" scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.picker-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  box-shadow: var(--shadow-elevated);
  width: 100%;
  max-width: 420px;
  height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &--preview {
    height: auto;
    max-height: calc(100dvh - 32px);
  }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.picker-title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.picker-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  font-size: 22px;
  color: var(--color-text-secondary);
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);
  cursor: pointer;

  &:hover {
    background: var(--color-empty);
  }
}

.picker-search {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  &__icon {
    position: absolute;
    left: 28px;
    width: 16px;
    height: 16px;
    color: var(--color-text-secondary);
    pointer-events: none;
  }

  &__input {
    width: 100%;
    padding: 8px 32px 8px 36px;
    border: 1.5px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: var(--font-md);
    background: var(--color-empty);
    color: var(--color-text);
    outline: none;
    transition:
      border-color var(--transition-fast),
      box-shadow var(--transition-fast);

    &:focus {
      border-color: var(--color-mint-alpha-25);
      box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
    }
  }

  &__clear {
    position: absolute;
    right: 24px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    font-size: 18px;
    color: var(--color-text-secondary);
    cursor: pointer;
  }
}

.picker-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;

  &__item {
    flex: 1;
    padding: 10px;
    border: none;
    background: none;
    font-size: var(--font-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition:
      color var(--transition-fast),
      border-color var(--transition-fast);

    &--active {
      color: var(--color-mint);
      border-bottom-color: var(--color-mint);
    }
  }
}

.picker-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.picker-filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: none;
  font-size: var(--font-xs);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  position: relative;
  transition:
    border-color var(--transition-fast),
    color var(--transition-fast);

  &--active {
    border-color: var(--color-mint);
    color: var(--color-mint);
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--color-mint);
    position: absolute;
    top: -2px;
    right: -2px;
  }
}

.picker-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--color-mint-alpha-10);
  border: 1px solid var(--color-mint-alpha-25);
  font-size: var(--font-xs);
  font-weight: 500;
  color: var(--color-mint);
  cursor: pointer;
  white-space: nowrap;
}

.picker-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.picker-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
  -webkit-tap-highlight-color: transparent;

  &:last-child {
    border-bottom: none;
  }
  &:active {
    background: var(--color-empty);
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__name {
    font-size: var(--font-base);
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__category {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }
}

.picker-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 20px;
  text-align: center;

  &--error p {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
  }
}

.picker-empty {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.picker-retry {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
}

.picker-sentinel {
  display: flex;
  justify-content: center;
  padding: 16px;
  min-height: 40px;
}

.picker-preview-body {
  padding: 4px 0;
}

.picker-preview-footer {
  padding: 12px 16px 16px;
  border-top: 1px solid var(--color-border);
  flex-shrink: 0;
}

.picker-select-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: var(--font-base);
  font-weight: 700;
  cursor: pointer;
  transition: background var(--transition-fast);

  &:hover {
    background: var(--color-mint-hover);
  }
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);

  &:last-child {
    border-bottom: none;
  }
}

.preview-meta {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.preview-label {
  font-size: var(--font-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

.preview-ingredients {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-ingredient {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;

  &__name {
    font-size: var(--font-sm);
    color: var(--color-text);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  &__opt {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
    font-style: italic;
  }

  &__amount {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
  }
}

.preview-recipe {
  font-size: var(--font-sm);
  color: var(--color-text);
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-active {
  .picker-panel {
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

.modal-leave-active {
  .picker-panel {
    transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1);
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .picker-panel {
    transform: translateY(100%);
  }
}
</style>
