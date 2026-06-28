<template>
  <div class="page-layout detail-page">
    <!-- Header -->
    <div class="detail-header">
      <button class="detail-header__back" aria-label="Назад" @click="goBack">
        <IconChevronLeft />
      </button>
      <div class="detail-header__info">
        <h1 class="detail-header__title">{{ store.currentList?.name ?? "" }}</h1>
        <span class="detail-header__dates">{{ dateRange }}</span>
      </div>
      <div class="detail-header__actions">
        <button
          class="detail-header__btn"
          aria-label="Редактировать"
          title="Редактировать"
          @click="showEditForm = true"
        >
          <IconPencil :width="18" :height="18" />
        </button>
        <button
          class="detail-header__btn"
          aria-label="Пересчитать"
          title="Пересчитать"
          @click="confirmRecalculate"
        >
          <IconRefresh />
        </button>
        <button
          class="detail-header__btn detail-header__btn--danger"
          aria-label="Удалить"
          title="Удалить"
          @click="confirmDeleteList"
        >
          <IconTrash />
        </button>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="detail-filters">
      <div class="tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          class="tabs__item"
          :class="{ 'tabs__item--active': activeFilter === tab.value }"
          @click="activeFilter = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count != null" class="tabs__count">{{ tab.count }}</span>
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
    <div v-else-if="!filteredGroups.length" class="empty-state">
      <p class="empty-state__text">
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
    <FabButton aria-label="Добавить позицию" @click="showAddItem = true">
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
              <button
                class="confirm-panel__btn confirm-panel__btn--cancel"
                @click="confirmDialog = null"
              >
                Отмена
              </button>
              <button
                class="confirm-panel__btn"
                :class="
                  confirmDialog.danger
                    ? 'confirm-panel__btn--danger'
                    : 'confirm-panel__btn--primary'
                "
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

<script lang="ts" setup>
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

const listId = computed(() => route.params.id as string)

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
  if (store.items.length === 0)
    return "В этом списке пока нет позиций. Проверьте, что на эти дни есть готовки. Добавьте вручную или выполните пересчёт."
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
    text: "При пересчёте позиции, рассчитанные по готовкам за выбранный период, будут обновлены. Если вручную добавленная позиция также присутствует в расчёте, её количество будет заменено на рассчитанное и флаг «Добавлено вручную» снимется. Ручные позиции, отсутствующие в расчёте, останутся без изменений.",
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

<style lang="scss" scoped>
.detail-page {
  padding: var(--page-padding-top) 16px calc(var(--nav-height) + 72px);

  @media (min-width: 600px) {
    padding: var(--page-padding-top-lg) 24px 88px;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;

  &__back {
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
    transition: background var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-empty);
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__dates {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  &__btn {
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
    transition:
      background var(--transition-fast),
      color var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    &:active {
      background: var(--color-empty);
    }

    &--danger {
      color: var(--color-danger);
    }
  }
}

.detail-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.detail-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 2px;

  &__header {
    font-size: var(--font-sm);
    font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
    padding: 6px 12px 4px;
  }

  &__items {
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
    overflow: hidden;

    > :deep(.item-row + .item-row) {
      border-top: 1px solid var(--color-border);
    }
  }
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: var(--z-confirm);
}

.confirm-panel {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-elevated);
  padding: 24px 20px 20px;
  width: 100%;
  max-width: 340px;

  &__title {
    font-size: var(--font-lg);
    font-weight: 700;
    color: var(--color-text);
    margin: 0 0 8px;
  }

  &__text {
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    margin: 0 0 20px;
    line-height: 1.5;
  }

  &__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  &__btn {
    padding: 10px 18px;
    border: none;
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast);

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    &--cancel {
      background: var(--color-empty);
      color: var(--color-text);

      &:hover {
        background: var(--color-border);
      }
    }

    &--primary {
      background: var(--color-mint);
      color: var(--on-primary);

      &:hover {
        background: var(--color-mint-hover);
      }
    }

    &--danger {
      background: var(--color-danger);
      color: var(--on-primary);

      &:hover {
        background: var(--color-danger-dark);
      }
    }
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
