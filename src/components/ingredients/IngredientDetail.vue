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
          <button v-if="isOwn" class="detail__btn detail__btn--delete" @click="notAvailable">
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
    :clone-ingredient="ingredient"
    @created="onCloneCreated"
  />

  <IngredientForm v-model="showEditForm" :edit-ingredient="ingredient" @updated="onUpdated" />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import ModalWrapper from "../forms/ModalWrapper.vue"
import IngredientForm from "../forms/IngredientForm.vue"
import OwnershipBadge from "../OwnershipBadge.vue"
import { useIngredientsStore } from "../../store/ingredients"
import { isDishOwn } from "../../utils/dishOwnership"
import { unitFullLabel } from "../../utils/unitLabels"
import type { DTOIngredient } from "@/types/ingredient"

const props = defineProps<{
  ingredient: DTOIngredient
}>()

const open = defineModel<boolean>({ required: true })

const store = useIngredientsStore()

const edited = ref<DTOIngredient | null>(null)
const ingredient = computed(() => edited.value ?? props.ingredient)
const isOwn = computed(() => isDishOwn(ingredient.value))

const showCloneForm = ref(false)
const showEditForm = ref(false)

watch(open, (value) => {
  if (!value) edited.value = null
})

function notAvailable() {
  store.showToast("Скоро будет доступно")
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
