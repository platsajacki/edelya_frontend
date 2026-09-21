import { Catalog } from "./Catalog"
import { MockResponse, MockServer } from "./MockServer"
import { WeekCalendar } from "./WeekCalendar"
import {
  aiDrafts,
  aiUsage,
  dishCategories,
  dishes,
  fixtures,
  ingredientCategories,
  ingredients,
  legalMarkdown,
  shoppingItems,
  shoppingLists,
  subscription,
  tariffs,
  weeks,
} from "../fixtures"
import type { DTOIngredient, DTOIngredientInUseError } from "@/types/ingredient"
import type { DTOShoppingListItem } from "@/types/shopping"

type Body = Record<string, unknown>

const SHOPPING = "/shopping/shopping-lists"

export class DevApi {
  private readonly dishes = new Catalog(Object.values(dishes))
  private readonly ingredients = new Catalog(Object.values(ingredients))
  private readonly drafts = new Catalog(Object.values(aiDrafts))
  private readonly lists = new Catalog(shoppingLists)
  private readonly items = new Catalog(shoppingItems)
  private readonly calendar = new WeekCalendar(weeks[0], weeks[1])
  private readonly server = new MockServer("/api/v1")
  constructor() {
    this.registerDishes()
    this.registerIngredients()
    this.registerDrafts()
    this.registerPlanning()
    this.registerShoppingLists()
    this.registerShoppingItems()
    this.registerAccount()
  }
  install() {
    this.server.install()
  }
  uninstall() {
    this.server.uninstall()
  }
  private registerDishes() {
    this.server
      .on("GET", "/dish-categories/", () => this.page(Object.values(dishCategories)))
      .on("GET", "/dishes/", (_, query) => this.dishes.page(query))
      .on("GET", "/dishes/([^/]+)/", ([id]) => this.dishes.find(id))
      .on("POST", "/dishes/", (_, __, body) => this.renamedDish(dishes.borsch.id, body as Body))
      .on("PUT", "/dishes/([^/]+)/", ([id], __, body) => this.renamedDish(id, body as Body))
      .on("DELETE", "/dishes/([^/]+)/", () => null)
  }
  private registerIngredients() {
    this.server
      .on("GET", "/ingredient-categories/", () => this.page(Object.values(ingredientCategories)))
      .on("GET", "/ingredients/", (_, query) => this.ingredients.page(query))
      .on("GET", "/ingredients/([^/]+)/", ([id]) => this.ingredients.find(id))
      .on("POST", "/ingredients/", (_, __, body) => this.savedIngredient(null, body as Body))
      .on("PATCH", "/ingredients/([^/]+)/", ([id], __, body) =>
        this.savedIngredient(id, body as Body)
      )
      .on("DELETE", "/ingredients/([^/]+)/", () => new MockResponse(409, this.ingredientInUse()))
  }
  private registerDrafts() {
    this.server
      .on("GET", "/ai-drafts/", () => this.drafts.page())
      .on("GET", "/ai-drafts/([^/]+)/", ([id]) => this.drafts.find(id))
      .on("POST", "/ai-drafts/", (_, __, body) =>
        this.drafts.add(fixtures.aiDraft("processing", String((body as Body).source_text)))
      )
      .on("PATCH", "/ai-drafts/([^/]+)/", ([id], __, body) => ({
        ...this.drafts.find(id),
        ...(body as Body),
      }))
      .on("POST", "/ai-drafts/([^/]+)/create-dish/", () => dishes.borsch)
  }
  private registerPlanning() {
    const event = weeks[0].cooking_events[0]
    const meal = weeks[0].meal_plan_items[0]
    this.server
      .on("GET", "/planning/year/(\\d+)/week/(\\d+)/", ([year, week]) =>
        this.calendar.weekFor(Number(year), Number(week))
      )
      .on("GET", "/planning/cooking-events/([^/]+)/", ([id]) => this.calendar.findCookingEvent(id))
      .on("POST", "/planning/cooking-events/", () => event)
      .on("PATCH", "/planning/cooking-events/([^/]+)/", () => event)
      .on("DELETE", "/planning/cooking-events/([^/]+)/", () => null)
      .on("POST", "/planning/meal-plan-items/", () => meal)
      .on("PATCH", "/planning/meal-plan-items/([^/]+)/", () => meal)
      .on("DELETE", "/planning/meal-plan-items/([^/]+)/", () => null)
  }
  private registerShoppingLists() {
    this.server
      .on("GET", `${SHOPPING}/`, (_, query) => this.lists.page(query))
      .on("GET", `${SHOPPING}/([^/]+)/`, ([id]) => this.lists.find(id))
      .on("POST", `${SHOPPING}/`, (_, __, body) => ({ ...shoppingLists[0], ...(body as Body) }))
      .on("PATCH", `${SHOPPING}/([^/]+)/`, ([id], __, body) => ({
        ...this.lists.find(id),
        ...(body as Body),
      }))
      .on("DELETE", `${SHOPPING}/([^/]+)/`, () => null)
      .on("POST", `${SHOPPING}/([^/]+)/recalculate/`, () => ({ detail: "ok" }))
  }
  private registerShoppingItems() {
    this.server
      .on("GET", `${SHOPPING}/([^/]+)/items/`, () => this.items.page())
      .on("POST", `${SHOPPING}/([^/]+)/items/`, (_, __, body) => this.addedItem(body as Body))
      .on("PATCH", `${SHOPPING}/([^/]+)/items/([^/]+)/`, ([, id], __, body) => ({
        ...this.items.find(id),
        ...(body as Body),
      }))
      .on("DELETE", `${SHOPPING}/([^/]+)/items/([^/]+)/`, () => null)
  }
  private registerAccount() {
    this.server
      .on("GET", "/subscriptions/me/", () => subscription)
      .on("GET", "/subscriptions/ai-recipe-usage/", () => aiUsage.partial)
      .on("GET", "/subscriptions/tariffs/", () => this.page(tariffs))
      .on("GET", "/subscriptions/tariffs/trial-duration/", () => ({ trial_duration: 7 }))
      .on("GET", "/subscriptions/dictionary/", () => ({
        default_trial_days: 7,
        grace_period_days: 3,
        ai_recipe_limit_per_period: aiUsage.partial.limit,
      }))
      .on("GET", "/legal/terms-of-service/latest/", () => ({ content: legalMarkdown }))
      .on("GET", "/legal/privacy-policy/latest/", () => ({ content: legalMarkdown }))
  }
  private page<T>(results: T[]) {
    return { count: results.length, next: null, previous: null, results }
  }
  private renamedDish(id: string, body: Body) {
    return { ...this.dishes.find(id), name: String(body.name ?? "") }
  }
  private savedIngredient(id: string | null, body: Body): DTOIngredient {
    const source = id ? this.ingredients.find(id) : ingredients.dill
    const category =
      Object.values(ingredientCategories).find((c) => c.id === body.category) ?? source.category
    return { ...source, ...body, category, owner: "dev-user" } as DTOIngredient
  }
  private addedItem(body: Body): DTOShoppingListItem {
    const ingredient = this.ingredients.find(String(body.ingredient))
    return fixtures.shoppingItem(ingredient, String(body.amount ?? "1"), { manual: true })
  }
  private ingredientInUse(): DTOIngredientInUseError {
    return {
      detail: "Ingredient is used and cannot be deleted.",
      dishes: [dishes.borsch, dishes.olivier].map(({ id, name }) => ({ id, name })),
      dishes_total: 4,
      shopping_lists: shoppingLists
        .slice(0, 2)
        .map(({ id, name, date_from, date_to }) => ({ id, name, date_from, date_to })),
      shopping_lists_total: 3,
    }
  }
}
