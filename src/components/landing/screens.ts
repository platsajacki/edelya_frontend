import plannerSrc from "@/assets/landing/screen-planner.webp"
import weekPosterSrc from "@/assets/landing/screen-week-poster.webp"
import weekVideoSrc from "@/assets/landing/screen-week-web.mp4"
import aiPosterSrc from "@/assets/landing/screen-ai-poster.webp"
import aiVideoSrc from "@/assets/landing/screen-ai-web.mp4"
import shoppingDetailPosterSrc from "@/assets/landing/screen-shopping-detail-poster.webp"
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
    file: "screen-planner.webp",
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
  ai: {
    caption: "AI-черновик рецепта",
    file: "screen-ai-web.mp4",
    src: aiPosterSrc,
    video: aiVideoSrc,
  },
} satisfies Record<string, LandingScreen>
