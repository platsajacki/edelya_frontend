<template>
  <DevState label="CardDetailSheet" row>
    <DevButton @click="opened = 'card-cooking'">готовка</DevButton>
    <DevButton @click="opened = 'card-meal'">приём пищи</DevButton>
  </DevState>
  <DevState label="RecipeDishDetail" row>
    <DevButton @click="opened = 'dish-own'">личное блюдо</DevButton>
    <DevButton @click="opened = 'dish-shared'">общее блюдо</DevButton>
  </DevState>
  <DevState label="IngredientDetail" row>
    <DevButton @click="opened = 'ingredient-own'">личный</DevButton>
    <DevButton @click="opened = 'ingredient-shared'">общий</DevButton>
  </DevState>
  <CardDetailSheet
    :model-value="opened === 'card-cooking'"
    :item="cooking"
    type="cooking"
    @update:model-value="closeOn"
  />
  <CardDetailSheet
    :model-value="opened === 'card-meal'"
    :item="meal"
    type="meal"
    @update:model-value="closeOn"
  />
  <RecipeDishDetail
    :model-value="opened === 'dish-own'"
    :dish="dishes.borsch"
    @update:model-value="closeOn"
  />
  <RecipeDishDetail
    :model-value="opened === 'dish-shared'"
    :dish="dishes.olivier"
    @update:model-value="closeOn"
  />
  <IngredientDetail
    :model-value="opened === 'ingredient-own'"
    :ingredient="ingredients.dill"
    @update:model-value="closeOn"
  />
  <IngredientDetail
    :model-value="opened === 'ingredient-shared'"
    :ingredient="ingredients.potato"
    @update:model-value="closeOn"
  />
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { useDevOpened } from "../useDevOpened"
import { dishes, fixtures, ingredients } from "../fixtures"
import CardDetailSheet from "@/components/CardDetailSheet.vue"
import RecipeDishDetail from "@/components/RecipeDishDetail.vue"
import IngredientDetail from "@/components/ingredients/IngredientDetail.vue"

const borschCooking = fixtures.cookingWithMeals(dishes.borsch, 0, [0, 1])
const cooking = { ...borschCooking.event, notes: "Сварить побольше, чтобы хватило на два дня." }
const meal = borschCooking.meals[1]
const { opened, closeOn } = useDevOpened()
</script>
