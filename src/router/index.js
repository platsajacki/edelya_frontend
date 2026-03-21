import { createRouter, createWebHashHistory } from "vue-router"
import { useAuthStore } from "../store/auth"
import HomePage from "../pages/HomePage.vue"
import ShoppingPage from "../pages/ShoppingPage.vue"
import RecipesPage from "../pages/RecipesPage.vue"

const routes = [
  { path: "/", component: HomePage },
  { path: "/shopping", component: ShoppingPage },
  { path: "/recipes", component: RecipesPage },
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
