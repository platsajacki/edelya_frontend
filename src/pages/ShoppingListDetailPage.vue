<template>
  <div class="page-layout detail-page">
    <!-- Header -->
    <div class="detail-header">
      <button class="detail-header__back" @click="goBack" aria-label="Назад">
        <IconChevronLeft />
      </button>
      <div class="detail-header__info">
        <h1 class="detail-header__title">{{ store.currentList?.name ?? "" }}</h1>
        <span class="detail-header__dates">{{ dateRange }}</span>
      </div>
      <div class="detail-header__actions">
        <button class="detail-header__btn" @click="showEditForm = true" aria-label="Редактировать" title="Редактировать">
          <IconPencil width="18" height="18" />
        </button>
        <button class="detail-header__btn" @click="confirmRecalculate" aria-label="Пересчитать" title="Пересчитать">
          <IconRefresh />
        </button>
        <button class="detail-header__btn detail-header__btn--danger" @click="confirmDeleteList" aria-label="Удалить" title="Удалить">
          <IconTrash />
        </button>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="detail-filters">
      <div class="detail-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="detail-tabs__item"
          :class="{ 'detail-tabs__item--active': activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count != null" class="detail-tabs__count">{{ tab.count }}</span>
        </button>
      </div>

    </div>

    <!-- Loading items -->
    <div v-if="store.loadingItems" class="detail-loading">
      <div class="spinner" />
    </div>

    <!-- Loading list -->
    <div v-else-if="store.loading" class="detail-loading">
      <div class="spinner" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!filteredGroups.length" class="detail-empty">
      <p class="detail-empty__text">
        {{ emptyText }}
      </p>
    </div>

    <!-- Grouped items -->
    <div v-else class="detail-groups">
      <div v-for="group in filteredGroups" :key="group.name" class="detail-group">
        <div class="detail-group__header">{{ group.name }}</div>
        <div class="detail-group__items">
          <ShoppingListItemRow
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            @toggle-checked="onToggleChecked"
            @adjust="onAdjust"
            @delete="onDeleteItem"
          />
        </div>
      </div>
    </div>

    <!-- FAB: add item -->
    <FabButton @click="showAddItem = true" aria-label="Добавить позицию">
      <IconPlus />
    </FabButton>

    <!-- Edit form modal -->
    <ShoppingListForm
      v-model="showEditForm"
      :edit-list="store.currentList"
      @updated="onListUpdated"
    />

    <!-- Add item modal -->
    <AddShoppingItemForm
      v-if="store.currentList"
      v-model="showAddItem"
      :list-id="store.currentList.id"
      @created="onItemCreated"
    />

    <!-- Confirmation overlay -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmDialog" class="confirm-overlay" @click.self="confirmDialog = null">
          <div class="confirm-panel">
            <h3 class="confirm-panel__title">{{ confirmDialog.title }}</h3>
            <p class="confirm-panel__text">{{ confirmDialog.text }}</p>
            <div class="confirm-panel__actions">
              <button class="confirm-panel__btn confirm-panel__btn--cancel" @click="confirmDialog = null">Отмена</button>
              <button
                class="confirm-panel__btn"
                :class="confirmDialog.danger ? 'confirm-panel__btn--danger' : 'confirm-panel__btn--primary'"
                :disabled="confirmBusy"
                @click="confirmDialog.action"
              >
                {{ confirmBusy ? "..." : confirmDialog.confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Toast :message="store.toast" @dismiss="store.toast = null" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { useShoppingStore } from "../store/shopping"
import { formatYMDtoDDMMYYYY } from "../utils/formatDate"
import ShoppingListItemRow from "../components/ShoppingListItemRow.vue"
import ShoppingListForm from "../components/forms/ShoppingListForm.vue"
import AddShoppingItemForm from "../components/forms/AddShoppingItemForm.vue"
import IconChevronLeft from "../components/icons/IconChevronLeft.vue"
import IconPencil from "../components/icons/IconPencil.vue"
import IconRefresh from "../components/icons/IconRefresh.vue"
import IconTrash from "../components/icons/IconTrash.vue"
import IconPlus from "../components/icons/IconPlus.vue"
import FabButton from "../components/FabButton.vue"
import Toast from "../components/Toast.vue"

const route = useRoute()
const router = useRouter()
const store = useShoppingStore()

const activeFilter = ref("all") // 'all' | 'unchecked' | 'checked'

const showEditForm = ref(false)
const showAddItem = ref(false)
const confirmDialog = ref(null)
const confirmBusy = ref(false)

const listId = computed(() => route.params.id)

const dateRange = computed(() => {
  if (!store.currentList) return ""
  const from = formatYMDtoDDMMYYYY(store.currentList.date_from)
  const to = formatYMDtoDDMMYYYY(store.currentList.date_to)
  return `${from} – ${to}`
})

const filterTabs = computed(() => [
  { value: "all", label: "Все", count: store.items.length },
  { value: "unchecked", label: "Не куплено", count: store.uncheckedCount },
  { value: "checked", label: "Куплено", count: store.checkedCount },
])

const filteredGroups = computed(() => {
  const groups = store.groupedItems

  return groups
    .map((group) => ({
      name: group.name,
      items: group.items.filter((item) => {
        if (activeFilter.value === "checked" && !item.is_checked) return false
        if (activeFilter.value === "unchecked" && item.is_checked) return false
        return true
      }),
    }))
    .filter((group) => group.items.length > 0)
})

const emptyText = computed(() => {
  if (store.items.length === 0) return "В этом списке пока нет позиций. Добавьте вручную или выполните пересчёт."
  if (activeFilter.value === "checked") return "Нет купленных позиций"
  if (activeFilter.value === "unchecked") return "Все позиции уже куплены!"
  return "Нет позиций"
})

onMounted(async () => {
  await store.loadList(listId.value)
  if (store.currentList) {
    await store.loadItems(listId.value)
  }
})

watch(listId, async (id) => {
  if (id) {
    await store.loadList(id)
    if (store.currentList) {
      await store.loadItems(id)
    }
  }
})

function goBack() {
  router.push("/shopping")
}

function onToggleChecked(item) {
  store.toggleItemChecked(listId.value, item)
}

function onAdjust(item, delta) {
  store.adjustItemAmount(listId.value, item, delta)
}

function onDeleteItem(item) {
  confirmDialog.value = {
    title: "Удалить позицию?",
    text: `«${item.ingredient?.name ?? "Позиция"}» будет удалена из списка.`,
    confirmLabel: "Удалить",
    danger: true,
    action: async () => {
      confirmBusy.value = true
      try {
        await store.removeItem(listId.value, item.id)
        confirmDialog.value = null
      } catch {
        store.showToast("Не удалось удалить позицию")
      } finally {
        confirmBusy.value = false
      }
    },
  }
}

function onListUpdated() {
  store.loadItems(listId.value)
}

function onItemCreated() {
  // Item already added to store by addItem action
}

function confirmRecalculate() {
  confirmDialog.value = {
    title: "Пересчитать список?",
    text: "Количества автоматических позиций будут обновлены на основе готовок за выбранный период. Вручную добавленные позиции останутся без изменений.",
    confirmLabel: "Пересчитать",
    danger: false,
    action: doRecalculate,
  }
}

async function doRecalculate() {
  confirmBusy.value = true
  try {
    await store.recalculateList(listId.value)
    confirmDialog.value = null
  } catch {
    store.showToast("Не удалось пересчитать список")
  } finally {
    confirmBusy.value = false
  }
}

function confirmDeleteList() {
  confirmDialog.value = {
    title: "Удалить список?",
    text: `Список «${store.currentList?.name ?? ""}» и все его позиции будут удалены.`,
    confirmLabel: "Удалить",
    danger: true,
    action: doDeleteList,
  }
}

async function doDeleteList() {
  confirmBusy.value = true
  try {
    await store.removeList(listId.value)
    confirmDialog.value = null
    router.push("/shopping")
  } catch {
    store.showToast("Не удалось удалить список")
  } finally {
    confirmBusy.value = false
  }
}
</script>

<style scoped>
.detail-page {
  padding: 12px 16px calc(var(--nav-height) + 72px);
}

/* ---- Header ---- */
.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-header__back {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.detail-header__back:active {
  background: var(--color-empty);
}

.detail-header__info {
  flex: 1;
  min-width: 0;
}

.detail-header__title {
  font-size: var(--font-lg);
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-header__dates {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.detail-header__actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.detail-header__btn {
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
  -webkit-tap-highlight-color: transparent;
}

.detail-header__btn:active {
  background: var(--color-empty);
}

.detail-header__btn--danger {
  color: var(--color-danger);
}

/* ---- Filters ---- */
.detail-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-tabs {
  display: flex;
  gap: 0;
  background: var(--color-empty);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.detail-tabs__item {
  flex: 1;
  padding: 7px 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.detail-tabs__item--active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.detail-tabs__count {
  font-size: 11px;
  font-weight: 700;
  opacity: 0.6;
}



/* ---- Loading ---- */
.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

/* ---- Empty ---- */
.detail-empty {
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

.detail-empty__text {
  font-size: var(--font-md);
  color: var(--color-text-secondary);
  margin: 0;
}

/* ---- Groups ---- */
.detail-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-group__header {
  font-size: var(--font-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  padding: 6px 12px 4px;
}

.detail-group__items {
  background: var(--color-surface);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.detail-group__items > :deep(.item-row + .item-row) {
  border-top: 1px solid var(--color-border);
}

/* ---- Confirm dialog ---- */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 1100;
}

.confirm-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 340px;
}

.confirm-panel__title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
}

.confirm-panel__text {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
  margin: 0 0 20px;
  line-height: 1.5;
}

.confirm-panel__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.confirm-panel__btn {
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.confirm-panel__btn--cancel {
  background: var(--color-empty);
  color: var(--color-text);
}

.confirm-panel__btn--cancel:hover {
  background: var(--color-border);
}

.confirm-panel__btn--primary {
  background: var(--color-mint);
  color: var(--on-primary);
}

.confirm-panel__btn--primary:hover {
  background: var(--color-mint-hover);
}

.confirm-panel__btn--danger {
  background: var(--color-danger);
  color: var(--on-primary);
}

.confirm-panel__btn--danger:hover {
  background: var(--color-danger-muted);
}

.confirm-panel__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (min-width: 600px) {
  .detail-page {
    padding: 16px 24px 88px;
  }
}
</style>
