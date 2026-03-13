import { createRouter, createWebHashHistory } from "vue-router"
import { useAuthStore } from "../store/auth"
import HomePage from "../pages/HomePage.vue"

const routes = [
  { path: "/", component: HomePage },
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
