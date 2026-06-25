/// <reference types="vite/client" />

import type { Telegram } from "@twa-dev/types"

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent
  export default component
}

declare global {
  interface Window {
    __APP_CONFIG__?: {
      apiUrl?: string
      telegramBot?: string
    }
    Telegram?: Telegram
  }
}
