import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.css"
import App from "./App.vue"
import { router } from "./router"

if (!import.meta.env.VITE_API) {
  throw new Error("VITE_API environment variable is not set")
}

createApp(App)
  .use(createPinia())
  .use(router)
  .mount("#app")
