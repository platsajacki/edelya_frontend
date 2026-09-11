export interface LandingScreen {
  caption: string
  file: string
  src: string
}

export const screens = {
  planner: { caption: "Главный экран — планировщик недели", file: "screen-planner.png", src: "" },
  dish: { caption: "Карточка блюда с ингредиентами", file: "screen-dish.png", src: "" },
  cooking: { caption: "Форма «Новая готовка»", file: "screen-cooking.png", src: "" },
  shopping: { caption: "Список покупок по категориям", file: "screen-shopping.png", src: "" },
  shoppingCheck: { caption: "Отметка покупок", file: "screen-shopping-check.png", src: "" },
  week: { caption: "Недельная сетка «Готовлю / Ем»", file: "screen-week.png", src: "" },
  shoppingDetail: {
    caption: "Детали списка покупок",
    file: "screen-shopping-detail.png",
    src: "",
  },
  recipes: { caption: "Список рецептов", file: "screen-recipes.png", src: "" },
  ai: { caption: "AI-черновик рецепта", file: "screen-ai.png", src: "" },
} satisfies Record<string, LandingScreen>
