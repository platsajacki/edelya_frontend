<template>
  <DevState v-for="state in states" :key="state.label" :label="state.label">
    <ShoppingListItemRow :item="state.item" />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import { fixtures, ingredients } from "../fixtures"
import ShoppingListItemRow from "@/components/ShoppingListItemRow.vue"

const states = [
  { label: "не куплено", item: fixtures.shoppingItem(ingredients.potato, "400") },
  { label: "крупная величина (г → кг)", item: fixtures.shoppingItem(ingredients.potato, "2500") },
  { label: "минимум шага (− недоступен)", item: fixtures.shoppingItem(ingredients.beet, "1") },
  {
    label: "добавлено вручную",
    item: fixtures.shoppingItem(ingredients.dill, "2", { manual: true }),
  },
  { label: "по вкусу", item: fixtures.shoppingItem(ingredients.salt, "0") },
  { label: "куплено", item: fixtures.shoppingItem(ingredients.milk, "1000", { checked: true }) },
]
</script>
