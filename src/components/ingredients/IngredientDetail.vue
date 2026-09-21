<template>
  <ModalWrapper v-model="open" title="Ингредиент" :z-index="990">
    <div class="detail">
      <div class="detail__section">
        <div class="detail__dish-header">
          <div class="detail__dish-title-row">
            <h3 class="detail__dish-name">{{ ingredient.name }}</h3>
            <OwnershipBadge :is-own="isOwn" own-label="Личный" shared-label="Общий" />
          </div>
        </div>
        <p v-if="ingredient.category?.name" class="detail__meta">{{ ingredient.category.name }}</p>
      </div>
      <div class="detail__section">
        <span class="detail__label">Единица измерения</span>
        <p class="detail__meta">{{ unitFullLabel(ingredient.base_unit) }}</p>
      </div>
    </div>

    <template #footer>
      <div class="detail__actions">
        <div class="detail__actions-row">
          <button v-if="isOwn" class="detail__btn detail__btn--delete" @click="confirming = true">
            Удалить
          </button>
          <button class="detail__btn detail__btn--secondary" @click="handleEdit">
            {{ isOwn ? "Редактировать" : "Создать личную копию" }}
          </button>
        </div>
        <button class="detail__btn detail__btn--cancel" @click="open = false">Закрыть</button>
      </div>
    </template>
  </ModalWrapper>

  <IngredientForm
    v-model="showCloneForm"
    mode="copy"
    :ingredient="ingredient"
    @created="onCloneCreated"
  />

  <IngredientForm
    v-model="showEditForm"
    mode="edit"
    :ingredient="ingredient"
    @updated="onUpdated"
  />

  <ModalWrapper v-model="confirming" title="Подтверждение" :z-index="1050">
    <p class="detail__confirm-text">Удалить ингредиент «{{ ingredient.name }}»?</p>
    <div class="detail__confirm-actions">
      <button class="detail__btn detail__btn--delete" :disabled="deleting" @click="confirmDelete">
        {{ deleting ? "Удаление…" : "Удалить" }}
      </button>
      <button class="detail__btn detail__btn--cancel" @click="confirming = false">Отмена</button>
    </div>
  </ModalWrapper>

  <ModalWrapper v-if="inUse" v-model="showInUse" title="Ингредиент используется" :z-index="1050">
    <div class="usage">
      <p class="usage__text">{{ usageText }}</p>

      <div v-if="inUse.dishes_total" class="usage__group">
        <span class="detail__label">Блюда · {{ inUse.dishes_total }}</span>
        <ul class="usage__list">
          <li v-for="dish in inUse.dishes" :key="dish.id">
            <button class="usage__item" type="button" @click="openDish(dish.id)">
              <span class="usage__name">{{ dish.name }}</span>
              <IconChevronRight :width="16" :height="16" />
            </button>
          </li>
          <li v-if="restDishes" class="usage__more">и ещё {{ restDishes }}</li>
        </ul>
      </div>

      <div v-if="inUse.shopping_lists_total" class="usage__group">
        <span class="detail__label">Списки покупок · {{ inUse.shopping_lists_total }}</span>
        <ul class="usage__list">
          <li v-for="list in inUse.shopping_lists" :key="list.id">
            <button class="usage__item" type="button" @click="openShoppingList(list.id)">
              <span class="usage__name">{{ list.name }}</span>
              <span class="usage__period">{{ listPeriod(list) }}</span>
              <IconChevronRight :width="16" :height="16" />
            </button>
          </li>
          <li v-if="restShoppingLists" class="usage__more">и ещё {{ restShoppingLists }}</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <button class="detail__btn detail__btn--cancel" @click="showInUse = false">Закрыть</button>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import ModalWrapper from "../forms/ModalWrapper.vue"
import IngredientForm from "../forms/IngredientForm.vue"
import OwnershipBadge from "../OwnershipBadge.vue"
import IconChevronRight from "../icons/IconChevronRight.vue"
import { useIngredientsStore } from "../../store/ingredients"
import { deleteIngredient } from "../../services/ingredientService"
import { isDishOwn } from "../../utils/dishOwnership"
import { unitFullLabel } from "../../utils/unitLabels"
import { formatDateRuShort } from "../../utils/formatDate"
import type {
  DTOIngredient,
  DTOIngredientInUseError,
  DTOIngredientUsageShoppingList,
} from "@/types/ingredient"

const props = defineProps<{
  ingredient: DTOIngredient
}>()

const emit = defineEmits<{
  (e: "open-dish", target: { dishId: string; ingredientId: string }): void
}>()

const open = defineModel<boolean>({ required: true })

const store = useIngredientsStore()
const router = useRouter()

const edited = ref<DTOIngredient | null>(null)
const ingredient = computed(() => edited.value ?? props.ingredient)
const isOwn = computed(() => isDishOwn(ingredient.value))

const showCloneForm = ref(false)
const showEditForm = ref(false)
const confirming = ref(false)
const deleting = ref(false)
const inUse = ref<DTOIngredientInUseError | null>(null)
const showInUse = ref(false)

const restDishes = computed(
  () => (inUse.value?.dishes_total ?? 0) - (inUse.value?.dishes.length ?? 0)
)
const restShoppingLists = computed(
  () => (inUse.value?.shopping_lists_total ?? 0) - (inUse.value?.shopping_lists.length ?? 0)
)

const usagePlaces = computed(() => {
  const places: string[] = []
  if (inUse.value?.dishes_total) places.push("блюд")
  if (inUse.value?.shopping_lists_total) places.push("списков покупок")
  return places.join(" и ")
})

const usageText = computed(
  () =>
    `Чтобы удалить ингредиент, сначала уберите его из ${usagePlaces.value}, где он используется.`
)

watch(open, (value) => {
  if (value) return
  edited.value = null
  confirming.value = false
})

function listPeriod(list: DTOIngredientUsageShoppingList) {
  return `${formatDateRuShort(list.date_from)} – ${formatDateRuShort(list.date_to)}`
}

function closeAll() {
  showInUse.value = false
  open.value = false
}

function openDish(dishId: string) {
  closeAll()
  emit("open-dish", { dishId, ingredientId: ingredient.value.id })
}

function openShoppingList(listId: string) {
  closeAll()
  router.push(`/shopping/${listId}`)
}

async function confirmDelete() {
  deleting.value = true
  try {
    await deleteIngredient(ingredient.value.id)
    confirming.value = false
    open.value = false
    store.onDeleted(ingredient.value.id)
  } catch (err) {
    onDeleteFailed(err)
  } finally {
    deleting.value = false
  }
}

function onDeleteFailed(err: unknown) {
  confirming.value = false
  const failure = err as { status?: number; body?: DTOIngredientInUseError }
  if (failure.status === 409 && failure.body) {
    inUse.value = failure.body
    showInUse.value = true
    return
  }
  store.showToast(err instanceof Error ? err.message : "Не удалось удалить ингредиент")
}

function handleEdit() {
  if (isOwn.value) {
    showEditForm.value = true
    return
  }
  showCloneForm.value = true
}

function onUpdated(updated: DTOIngredient) {
  edited.value = updated
  store.onUpdated(updated)
}

function onCloneCreated() {
  showCloneForm.value = false
  open.value = false
  store.onCopyCreated()
}
</script>

<style lang="scss">
@use "../../styles/detail-sheet";
</style>

<style lang="scss" scoped>
.usage {
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__text {
    margin: 0;
    font-size: var(--font-sm);
    color: var(--color-text-secondary);
    line-height: 1.45;
  }

  &__group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    color: var(--color-text);
    text-align: left;
    transition:
      background var(--transition-fast),
      transform var(--transition-fast);
    -webkit-tap-highlight-color: transparent;

    @media (hover: hover) {
      &:hover {
        background: var(--color-empty);
      }
    }

    &:active {
      transform: scale(var(--press-scale-sm));
    }

    svg {
      flex-shrink: 0;
      margin-left: auto;
      color: var(--color-text-secondary);
    }
  }

  &__name {
    min-width: 0;
  }

  &__period {
    flex-shrink: 0;
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }

  &__more {
    font-size: var(--font-xs);
    color: var(--color-text-secondary);
  }
}
</style>
