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
          <button class="detail__btn detail__btn--secondary" @click="notAvailable">
            {{ isOwn ? "Редактировать" : "Создать личную копию" }}
          </button>
        </div>
        <button class="detail__btn detail__btn--cancel" @click="open = false">Закрыть</button>
      </div>
    </template>
  </ModalWrapper>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import ModalWrapper from "../forms/ModalWrapper.vue"
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

const isOwn = computed(() => isDishOwn(props.ingredient))

function notAvailable() {
  store.showToast("Скоро будет доступно")
}
</script>

<style lang="scss">
@use "../../styles/detail-sheet";
</style>
