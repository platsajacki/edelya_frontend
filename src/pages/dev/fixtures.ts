import { formatYMDtoDDMMYYYY } from "@/utils/formatDate"
import { getTodayISO } from "@/utils/weekDays"
import type { DTOBaseUnit, DTOIngredient } from "@/types/ingredient"
import type { DTODish, DTODishIngredient } from "@/types/dish"
import type { DTOCookingEvent, DTOMealPlanItem } from "@/types/planning"
import type { DTOShoppingList, DTOShoppingListItem } from "@/types/shopping"

const NOW = "2026-09-21T12:00:00Z"
const OWNER = "dev-user"
const WEEKDAYS = ["ВС", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ"]

interface DishOptions {
  own?: boolean
  category?: string
  ingredients?: DTODishIngredient[]
  recipe?: string
}

interface ShoppingItemOptions {
  checked?: boolean
  manual?: boolean
}

class FixtureFactory {
  private sequence = 0
  isoDate(offsetDays = 0): string {
    const date = new Date(getTodayISO() + "T00:00:00")
    date.setDate(date.getDate() + offsetDays)
    return date.toLocaleDateString("sv-SE")
  }
  weekday(offsetDays = 0): string {
    return WEEKDAYS[new Date(this.isoDate(offsetDays) + "T00:00:00").getDay()]
  }
  displayDate(offsetDays = 0): string {
    return formatYMDtoDDMMYYYY(this.isoDate(offsetDays))
  }
  ingredient(name: string, unit: DTOBaseUnit, category = "Овощи", own = false): DTOIngredient {
    return {
      id: this.nextId("ing"),
      owner: own ? OWNER : null,
      name,
      base_unit: unit,
      is_active: true,
      category: { id: this.nextId("ing-cat"), name: category, created_at: NOW, updated_at: NOW },
      created_at: NOW,
      updated_at: NOW,
    }
  }
  dishIngredient(ingredient: DTOIngredient, amount: string, optional = false): DTODishIngredient {
    return {
      id: this.nextId("di"),
      dish: "",
      ingredient,
      is_optional: optional,
      amount,
      created_at: NOW,
      updated_at: NOW,
    }
  }
  dish(name: string, options: DishOptions = {}): DTODish {
    return {
      id: this.nextId("dish"),
      owner: options.own === false ? null : OWNER,
      category: {
        id: ++this.sequence,
        name: options.category ?? "",
        created_at: NOW,
        updated_at: NOW,
      },
      dish_ingredients: options.ingredients ?? [],
      name,
      recipe: options.recipe ?? "",
      is_active: true,
      created_at: NOW,
      updated_at: NOW,
    }
  }
  mealItem(dish: DTODish, offsetDays = 0, extra: Partial<DTOMealPlanItem> = {}): DTOMealPlanItem {
    return {
      id: this.nextId("mpi"),
      dish,
      owner: OWNER,
      date: this.isoDate(offsetDays),
      position: this.sequence,
      created_at: NOW,
      updated_at: NOW,
      ...extra,
    }
  }
  cookingEvent(
    dish: DTODish,
    offsetDays = 0,
    extra: Partial<DTOCookingEvent> = {}
  ): DTOCookingEvent {
    return {
      id: this.nextId("ce"),
      dish,
      cooking_date: this.isoDate(offsetDays),
      meal_plan_items: [],
      created_at: NOW,
      updated_at: NOW,
      ...extra,
    }
  }
  shoppingList(name: string, fromOffset: number, toOffset: number): DTOShoppingList {
    return {
      id: this.nextId("sl"),
      name,
      date_from: this.isoDate(fromOffset),
      date_to: this.isoDate(toOffset),
      created_at: NOW,
      updated_at: NOW,
    }
  }
  shoppingItem(
    ingredient: DTOIngredient,
    amount: string,
    options: ShoppingItemOptions = {}
  ): DTOShoppingListItem {
    return {
      id: this.nextId("sli"),
      shopping_list: "dev-list",
      ingredient,
      amount,
      owner: OWNER,
      is_checked: options.checked ?? false,
      checked_at: options.checked ? NOW : null,
      is_manual: options.manual ?? false,
      position: this.sequence,
      created_at: NOW,
      updated_at: NOW,
    }
  }
  private nextId(prefix: string): string {
    return `${prefix}-${++this.sequence}`
  }
}

export const fixtures = new FixtureFactory()

export const ingredients = {
  potato: fixtures.ingredient("Картофель", "gram"),
  beet: fixtures.ingredient("Свёкла", "piece"),
  milk: fixtures.ingredient("Молоко", "milliliter", "Молочное"),
  salt: fixtures.ingredient("Соль", "to_taste", "Специи"),
  dill: fixtures.ingredient("Укроп домашний", "bunch", "Зелень", true),
  flour: fixtures.ingredient("Мука высшего сорта из твёрдых сортов пшеницы", "kilogram", "Бакалея"),
}

const borschIngredients = [
  fixtures.dishIngredient(ingredients.beet, "2"),
  fixtures.dishIngredient(ingredients.potato, "400"),
  fixtures.dishIngredient(ingredients.dill, "1", true),
  fixtures.dishIngredient(ingredients.salt, "0"),
]

export const dishes = {
  borsch: fixtures.dish("Борщ", {
    category: "Супы",
    ingredients: borschIngredients,
    recipe: "Сварить бульон, добавить овощи, варить 40 минут. Подавать со сметаной.",
  }),
  syrniki: fixtures.dish("Сырники", {
    category: "Завтраки",
    ingredients: [
      fixtures.dishIngredient(ingredients.milk, "200"),
      fixtures.dishIngredient(ingredients.flour, "0.2"),
    ],
  }),
  olivier: fixtures.dish("Оливье", {
    own: false,
    category: "Салаты",
    ingredients: [fixtures.dishIngredient(ingredients.potato, "300")],
  }),
  lasagna: fixtures.dish("Лазанья болоньезе с домашней пастой и соусом бешамель", {
    own: false,
    ingredients: [
      fixtures.dishIngredient(ingredients.flour, "0.5"),
      fixtures.dishIngredient(ingredients.milk, "500"),
    ],
  }),
}
