<template>
  <DevState v-for="group in groups" :key="group.label" :label="group.label" row>
    <DevButton v-for="state in group.states" :key="state.key" @click="opened = state.key">
      {{ state.label }}
    </DevButton>
  </DevState>
  <DishForm :model-value="opened === 'dish-create'" @update:model-value="closeOn" />
  <DishForm
    :model-value="opened === 'dish-named'"
    initial-name="Плов с курицей"
    @update:model-value="closeOn"
  />
  <DishForm
    :model-value="opened === 'dish-edit'"
    :edit-dish="dishes.borsch"
    @update:model-value="closeOn"
  />
  <DishForm
    :model-value="opened === 'dish-clone'"
    :clone-dish="dishes.olivier"
    @update:model-value="closeOn"
  />
  <DishForm
    :model-value="opened === 'dish-highlight'"
    :edit-dish="dishes.borsch"
    :highlight-ingredient-id="ingredients.beef.id"
    @update:model-value="closeOn"
  />
  <IngredientForm :model-value="opened === 'ingredient-create'" @update:model-value="closeOn" />
  <IngredientForm
    :model-value="opened === 'ingredient-edit'"
    mode="edit"
    :ingredient="ingredients.dill"
    @update:model-value="closeOn"
  />
  <IngredientForm
    :model-value="opened === 'ingredient-copy'"
    mode="copy"
    :ingredient="ingredients.potato"
    @update:model-value="closeOn"
  />
  <IngredientForm
    :model-value="opened === 'ingredient-draft'"
    mode="from-draft"
    :initial="draftIngredient"
    @update:model-value="closeOn"
  />
  <MealPlanItemForm
    :model-value="opened === 'meal-create'"
    :initial-date="fixtures.isoDate()"
    @update:model-value="closeOn"
  />
  <MealPlanItemForm
    :model-value="opened === 'meal-edit'"
    :edit-item="manualMeal"
    @update:model-value="closeOn"
  />
  <MealPlanItemForm
    :model-value="opened === 'meal-linked'"
    :edit-item="borschCooking.meals[1]"
    @update:model-value="closeOn"
  />
  <CookingEventForm
    :model-value="opened === 'cooking-create'"
    :initial-date="fixtures.isoDate()"
    @update:model-value="closeOn"
  />
  <CookingEventForm
    :model-value="opened === 'cooking-fixed'"
    :initial-date="fixtures.isoDate()"
    :fixed-dish="dishes.syrniki"
    @update:model-value="closeOn"
  />
  <CookingEventForm
    :model-value="opened === 'cooking-edit'"
    :edit-item="borschCooking.event"
    @update:model-value="closeOn"
  />
  <ShoppingListForm :model-value="opened === 'list-create'" @update:model-value="closeOn" />
  <ShoppingListForm
    :model-value="opened === 'list-edit'"
    :edit-list="shoppingLists[0]"
    @update:model-value="closeOn"
  />
  <AddShoppingItemForm
    :model-value="opened === 'item-add'"
    :list-id="shoppingLists[0].id"
    @update:model-value="closeOn"
  />
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import DevButton from "../DevButton.vue"
import { useDevOpened } from "../useDevOpened"
import { dishes, fixtures, ingredientCategories, ingredients, shoppingLists } from "../fixtures"
import DishForm from "@/components/forms/DishForm.vue"
import IngredientForm from "@/components/forms/IngredientForm.vue"
import MealPlanItemForm from "@/components/forms/MealPlanItemForm.vue"
import CookingEventForm from "@/components/forms/CookingEventForm.vue"
import ShoppingListForm from "@/components/forms/ShoppingListForm.vue"
import AddShoppingItemForm from "@/components/forms/AddShoppingItemForm.vue"

const groups = [
  {
    label: "DishForm",
    states: [
      { key: "dish-create", label: "создание" },
      { key: "dish-named", label: "создание с названием" },
      { key: "dish-edit", label: "редактирование" },
      { key: "dish-clone", label: "копия общего" },
      { key: "dish-highlight", label: "подсветка ингредиента" },
    ],
  },
  {
    label: "IngredientForm",
    states: [
      { key: "ingredient-create", label: "create" },
      { key: "ingredient-edit", label: "edit" },
      { key: "ingredient-copy", label: "copy" },
      { key: "ingredient-draft", label: "from-draft" },
    ],
  },
  {
    label: "MealPlanItemForm",
    states: [
      { key: "meal-create", label: "создание" },
      { key: "meal-edit", label: "редактирование" },
      { key: "meal-linked", label: "привязан к готовке" },
    ],
  },
  {
    label: "CookingEventForm",
    states: [
      { key: "cooking-create", label: "создание" },
      { key: "cooking-fixed", label: "с выбранным блюдом" },
      { key: "cooking-edit", label: "редактирование" },
    ],
  },
  {
    label: "ShoppingListForm / AddShoppingItemForm",
    states: [
      { key: "list-create", label: "новый список" },
      { key: "list-edit", label: "редактирование списка" },
      { key: "item-add", label: "добавить позицию" },
    ],
  },
]
const draftIngredient = {
  name: "Тыква мускатная",
  categoryId: ingredientCategories.vegetables.id,
  baseUnit: "kilogram" as const,
}
const manualMeal = fixtures.mealItem(dishes.syrniki, 0, { is_manual: true })
const borschCooking = fixtures.cookingWithMeals(dishes.borsch, 0, [0, 1, 2])
const { opened, closeOn } = useDevOpened()
</script>
