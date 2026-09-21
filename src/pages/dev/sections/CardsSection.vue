<template>
  <DevState label="MealCard: own / shared / manual / color / saving" row>
    <MealCard v-for="item in mealCards" :key="item.id" :item="item" />
  </DevState>
  <DevState label="RecipeDishCard: ≤3 ингредиентов / >3 / без категории">
    <RecipeDishCard :dish="dishes.syrniki" />
    <RecipeDishCard :dish="dishes.borsch" />
    <RecipeDishCard :dish="dishes.lasagna" />
  </DevState>
  <DevState label="IngredientCard: с категорией / длинное название">
    <IngredientCard :ingredient="ingredients.potato" />
    <IngredientCard :ingredient="ingredients.flour" />
  </DevState>
  <DevState label="ShoppingListCard: диапазон / один день">
    <ShoppingListCard :list="weekList" />
    <ShoppingListCard :list="dayList" />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import { dishes, fixtures, ingredients } from "../fixtures"
import MealCard from "@/components/MealCard.vue"
import RecipeDishCard from "@/components/RecipeDishCard.vue"
import IngredientCard from "@/components/ingredients/IngredientCard.vue"
import ShoppingListCard from "@/components/ShoppingListCard.vue"
import { usePlanningStore } from "@/store/planning"

const savingItem = fixtures.mealItem(dishes.syrniki)
const mealCards = [
  fixtures.mealItem(dishes.borsch),
  fixtures.mealItem(dishes.olivier),
  fixtures.mealItem(dishes.syrniki, 0, { is_manual: true }),
  fixtures.mealItem(dishes.lasagna, 0, { color: "#e07a5f" }),
  savingItem,
]
usePlanningStore().savingItemIds.push(savingItem.id)
const weekList = fixtures.shoppingList("Продукты на неделю", 0, 6)
const dayList = fixtures.shoppingList("Продукты на завтра", 1, 1)
</script>
