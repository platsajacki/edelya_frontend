import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { useAuthStore } from "../store/auth"
import { isMiniApp } from "../dom/isMiniApp"
import HomePage from "../pages/HomePage.vue"
import ShoppingPage from "../pages/ShoppingPage.vue"
import ShoppingListDetailPage from "../pages/ShoppingListDetailPage.vue"
import RecipesPage from "../pages/RecipesPage.vue"
import CabinetPage from "../pages/CabinetPage.vue"
import TermsPage from "../pages/TermsPage.vue"
import PrivacyPage from "../pages/PrivacyPage.vue"

const APP_TITLE = "Еделя"
const LANDING_TITLE = "Еделя — планировщик питания и покупок"
const miniApp = isMiniApp()

const miniAppRoutes: RouteRecordRaw[] = [
  { path: "/shopping", component: ShoppingPage },
  { path: "/shopping/:id", component: ShoppingListDetailPage, meta: { requiresAuth: true } },
  { path: "/recipes", component: RecipesPage },
  { path: "/cabinet", component: CabinetPage },
]

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: miniApp ? HomePage : () => import("@/pages/LandingPage.vue"),
    meta: { title: miniApp ? APP_TITLE : LANDING_TITLE },
  },
  ...(miniApp ? miniAppRoutes : []),
  {
    path: "/terms",
    component: TermsPage,
    meta: { title: "Условия использования — Еделя" },
  },
  {
    path: "/privacy",
    component: PrivacyPage,
    meta: { title: "Политика конфиденциальности — Еделя" },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().user) {
    return "/"
  }
})

router.afterEach((to) => {
  document.title = typeof to.meta.title === "string" ? to.meta.title : APP_TITLE
})

if (miniApp && import.meta.env.VITE_DEBUG === "1") {
  router.addRoute({ path: "/dev/icons", component: () => import("@/pages/DevIconsPage.vue") })
  router.addRoute({ path: "/dev/ui", component: () => import("@/pages/DevUiPage.vue") })
}
