import { onUnmounted } from "vue"
import { DevApi } from "./DevApi"
import { aiUsage, subscription } from "../fixtures"
import { useSubscriptionStore } from "@/store/subscription"

export function useDevApi() {
  const api = new DevApi()
  const store = useSubscriptionStore()
  api.install()
  store.subscription = subscription
  store.aiRecipeUsage = aiUsage.partial
  onUnmounted(() => api.uninstall())
}
