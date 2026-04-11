import { createRouter, createWebHashHistory } from "vue-router"
import { useAuthStore } from "../store/auth"
import HomePage from "../pages/HomePage.vue"
import ShoppingPage from "../pages/ShoppingPage.vue"
import ShoppingListDetailPage from "../pages/ShoppingListDetailPage.vue"
import RecipesPage from "../pages/RecipesPage.vue"
import BillingPage from "../pages/BillingPage.vue"

const routes = [
  { path: "/", component: HomePage },
  { path: "/shopping", component: ShoppingPage },
  { path: "/shopping/:id", component: ShoppingListDetailPage, meta: { requiresAuth: true } },
  { path: "/recipes", component: RecipesPage },
  { path: "/billing", component: BillingPage },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !useAuthStore().user) {
    return "/"
  }
})
