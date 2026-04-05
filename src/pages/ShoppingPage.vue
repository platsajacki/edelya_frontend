<template>
  <div class="shopping-page">
    <div class="shopping-header">
      <h1 class="shopping-header__title">Покупки</h1>
      <button
        v-if="store.lists.length"
        class="shopping-header__sort"
        type="button"
        :title="sortAsc ? 'Сортировка: сначала старые' : 'Сортировка: сначала новые'"
        @click="sortAsc = !sortAsc"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
          <line x1="2" y1="4" x2="10" y2="4"/>
          <line x1="2" y1="8" x2="8" y2="8"/>
          <line x1="2" y1="12" x2="6" y2="12"/>
          <polyline v-if="sortAsc" points="13 11 13 5 11 7"/>
          <polyline v-else points="13 5 13 11 11 9"/>
        </svg>
        {{ sortAsc ? 'Сначала старые' : 'Сначала новые' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="shopping-loading">
      <div class="spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.lists.length" class="shopping-empty">
      <svg class="shopping-empty__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p class="shopping-empty__text">Нет списков покупок</p>
      <button class="shopping-empty__add" @click="showForm = true">
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
    <button class="shopping-fab" @click="showForm = true" aria-label="Создать список">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <!-- Create form -->
    <ShoppingListForm
      v-model="showForm"
      @created="onListCreated"
    />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="store.toast" class="shopping-toast" @click="store.toast = null">
        {{ store.toast }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useShoppingStore } from "../store/shopping"
import ShoppingListCard from "../components/ShoppingListCard.vue"
import ShoppingListForm from "../components/forms/ShoppingListForm.vue"

const store = useShoppingStore()
const router = useRouter()

const showForm = ref(false)
const sortAsc = ref(false)

const sortedLists = computed(() => {
  return [...store.lists].sort((a, b) => {
    const da = a.date_from ?? ""
    const db = b.date_from ?? ""
    return sortAsc.value ? da.localeCompare(db) : db.localeCompare(da)
  })
})

onMounted(() => {
  store.loadLists()
})

function openList(list) {
  router.push(`/shopping/${list.id}`)
}

function onListCreated(list) {
  router.push(`/shopping/${list.id}`)
}
</script>

<style scoped>
.shopping-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 80px;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  transition: border-color 0.15s, color 0.15s;
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

/* Loading */
.shopping-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

/* Empty */
.shopping-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 24px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  text-align: center;
}

.shopping-empty__icon {
  color: var(--color-border);
}

.shopping-empty__text {
  font-size: var(--font-md);
  color: var(--color-text-secondary);
  margin: 0;
}

.shopping-empty__add {
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

.shopping-empty__add:hover {
  background: var(--color-mint-hover);
}

/* List */
.shopping-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* FAB */
.shopping-fab {
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

.shopping-fab:hover {
  background: var(--color-mint-hover);
}

.shopping-fab:active {
  transform: scale(0.93);
}

/* Toast */
.shopping-toast {
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
  .shopping-page {
    max-width: 540px;
    padding: 16px 24px 88px;
  }
}
</style>
