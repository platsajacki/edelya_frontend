<template>
  <div class="page-layout shopping-page">
    <div class="shopping-header">
      <h1 class="shopping-header__title">Покупки</h1>
      <button
        class="shopping-header__sort"
        type="button"
        :title="sortAsc ? 'Сортировка: сначала старые' : 'Сортировка: сначала новые'"
        @click="sortAsc = !sortAsc"
      >
        <IconSort :ascending="sortAsc" />
        {{ sortAsc ? 'Сначала старые' : 'Сначала новые' }}
      </button>
    </div>

    <!-- Search -->
    <div class="shopping-search">
      <IconSearch class="shopping-search__icon" />
      <input
        v-model="searchQuery"
        type="search"
        class="shopping-search__input"
        placeholder="Поиск списка..."
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        class="shopping-search__clear"
        @click="clearSearch"
        aria-label="Очистить"
      >
        &times;
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="shopping-loading">
      <div class="spinner" />
    </div>

    <!-- Empty state: search found nothing -->
    <div v-else-if="!store.lists.length && searchQuery" class="empty-state">
      <p class="empty-state__text">По запросу «{{ searchQuery }}» ничего не найдено</p>
      <button class="empty-state__secondary" @click="clearSearch">Сбросить поиск</button>
    </div>

    <!-- Empty state: no lists at all -->
    <div v-else-if="!store.lists.length" class="empty-state">
      <IconShoppingBag class="empty-state__icon" width="48" height="48" />
      <p class="empty-state__text">Нет списков покупок</p>
      <button class="empty-state__action" @click="showForm = true">
        + Создать список
      </button>
    </div>

    <!-- Lists -->
    <div v-else class="shopping-list">
      <ShoppingListCard
        v-for="list in sortedLists"
        :key="list.id"
        :list="list"
        @tap="openList"
      />
    </div>

    <!-- FAB -->
    <FabButton @click="showForm = true" aria-label="Создать список">
      <IconPlus />
    </FabButton>

    <!-- Create form -->
    <ShoppingListForm
      v-model="showForm"
      @created="onListCreated"
    />

    <!-- Toast -->
    <Toast :message="store.toast" @dismiss="store.toast = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"

defineOptions({ name: "ShoppingPage" })

import { useShoppingStore } from "../store/shopping"
import ShoppingListCard from "../components/ShoppingListCard.vue"
import ShoppingListForm from "../components/forms/ShoppingListForm.vue"
import IconSort from "../components/icons/IconSort.vue"
import IconSearch from "../components/icons/IconSearch.vue"
import IconShoppingBag from "../components/icons/IconShoppingBag.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"

const store = useShoppingStore()
const router = useRouter()

const showForm = ref(false)
const sortAsc = ref(false)
const searchQuery = ref(store.filters.search)
let searchTimer = null

const sortedLists = computed(() => {
  return [...store.lists].sort((a, b) => {
    const da = a.created_at ?? ""
    const db = b.created_at ?? ""
    return sortAsc.value ? da.localeCompare(db) : db.localeCompare(da)
  })
})

onMounted(() => {
  store.loadLists()
})

onUnmounted(() => {
  clearTimeout(searchTimer)
})

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

function openList(list) {
  router.push(`/shopping/${list.id}`)
}

function onListCreated(list) {
  router.push(`/shopping/${list.id}`)
}
</script>

<style scoped>
.shopping-page {
  padding: 12px 16px calc(var(--nav-height) + 72px);
}

.shopping-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shopping-header__sort {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
}

.shopping-header__sort:active {
  color: var(--color-mint);
  border-color: var(--color-mint);
}

.shopping-header__title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

/* Search */
.shopping-search {
  position: relative;
  display: flex;
  align-items: center;
}

.shopping-search__icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.shopping-search__input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-md);
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.shopping-search__input:focus {
  border-color: var(--color-mint-alpha-25);
  box-shadow: 0 0 0 3px var(--color-mint-alpha-10);
}

.shopping-search__input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.shopping-search__clear {
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
  border-radius: var(--radius-xs);
  transition: background var(--transition-fast);
}

.shopping-search__clear:hover {
  background: var(--color-empty);
}

/* Loading */
.shopping-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

/* List */
.shopping-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 600px) {
  .shopping-page {
    padding: 16px 24px 88px;
  }
}
</style>
