import plannerSrc from "@/assets/landing/screen-planner.jpg"
import weekPosterSrc from "@/assets/landing/screen-week-poster.jpg"
import weekVideoSrc from "@/assets/landing/screen-week-web.mp4"
import shoppingDetailPosterSrc from "@/assets/landing/screen-shopping-detail-poster.jpg"
import shoppingDetailVideoSrc from "@/assets/landing/screen-shopping-detail-web.mp4"

export interface LandingScreen {
  caption: string
  file: string
  src: string
  video?: string
}

export const screens = {
  planner: {
    caption: "Главный экран — планировщик недели",
    file: "screen-planner.jpg",
    src: plannerSrc,
  },
  week: {
    caption: "Недельная сетка «Готовлю / Ем»",
    file: "screen-week-web.mp4",
    src: weekPosterSrc,
    video: weekVideoSrc,
  },
  shoppingDetail: {
    caption: "Детали списка покупок",
    file: "screen-shopping-detail-web.mp4",
    src: shoppingDetailPosterSrc,
    video: shoppingDetailVideoSrc,
  },
  recipes: { caption: "Список рецептов", file: "screen-recipes.gif", src: "", },
  ai: { caption: "AI-черновик рецепта", file: "screen-ai.gif", src: "", },
} satisfies Record<string, LandingScreen>
