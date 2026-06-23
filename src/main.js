import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.scss"
import App from "./App.vue"
import { router } from "./router"

if (!import.meta.env.VITE_API) {
  throw new Error("API URL is not configured (VITE_API or config.js)")
}

createApp(App).use(createPinia()).use(router).mount("#app")
