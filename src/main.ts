import { createApp } from "vue"
import { createPinia } from "pinia"
import "./style.scss"
import "./styles/animations.scss"
import App from "./App.vue"
import { router } from "./router"
import { isMiniApp } from "./dom/isMiniApp"

if (!window.__APP_CONFIG__?.apiUrl && !import.meta.env.VITE_API) {
  throw new Error("API URL is not configured (VITE_API or config.js)")
}

const miniApp = isMiniApp()

if (!miniApp) {
  document
    .querySelector("meta[name=viewport]")
    ?.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover")
}

async function mountApp(): Promise<void> {
  const app = createApp(App).use(createPinia()).use(router)

  if (!miniApp) await router.isReady()

  app.mount("#app")
}

void mountApp()
