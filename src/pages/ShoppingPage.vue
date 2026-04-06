<template>
  <div class="page-layout shopping-page">
    <div class="shopping-header">
      <h1 class="shopping-header__title">Покупки</h1>
      <button
        v-if="store.lists.length"
        class="shopping-header__sort"
        type="button"
        :title="sortAsc ? 'Сортировка: сначала старые' : 'Сортировка: сначала новые'"
        @click="sortAsc = !sortAsc"
      >
        <IconSort :ascending="sortAsc" />
        {{ sortAsc ? 'Сначала старые' : 'Сначала новые' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="shopping-loading">
      <div class="spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!store.lists.length" class="shopping-empty">
      <IconShoppingBag class="shopping-empty__icon" width="48" height="48" :stroke-width="1.2" />
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
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useShoppingStore } from "../store/shopping"
import ShoppingListCard from "../components/ShoppingListCard.vue"
import ShoppingListForm from "../components/forms/ShoppingListForm.vue"
import IconSort from "../components/icons/IconSort.vue"
import IconShoppingBag from "../components/icons/IconShoppingBag.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"

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

@media (min-width: 600px) {
  .shopping-page {
    padding: 16px 24px 88px;
  }
}
</style>
