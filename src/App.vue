<template>
  <div v-if="loading" class="app-loading">
    <div class="spinner" />
  </div>
  <ConsentScreen v-else-if="auth.requiresConsent" />
  <div v-else class="app-shell">
    <div class="app-shell__content">
      <RouterView v-slot="{ Component }">
        <KeepAlive :include="['RecipesPage', 'ShoppingPage']">
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </div>
    <BottomNav v-if="auth.user" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "./store/auth"
import { useSubscriptionStore } from "./store/subscription"
import BottomNav from "./components/BottomNav.vue"
import ConsentScreen from "./components/ConsentScreen.vue"

const auth = useAuthStore()
const subscription = useSubscriptionStore()
const router = useRouter()
const loading = ref(true)

onMounted(async () => {
  const tg = window.Telegram?.WebApp

  try {
    tg?.ready()
    tg?.expand()
    tg?.requestFullscreen?.()
  } catch (e) {
    // ignore
  }

  window.addEventListener("auth:expired", () => auth.logout())

  try {
    await auth.init()
    if (auth.user) {
      await subscription.loadMySubscription().catch(() => {})
      if (router.currentRoute.value.path === "/") {
        router.push("/")
      }
    }
  } catch (err) {
    console.error("Auth failed:", err)
    auth.logout()
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.app-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
}

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

.app-shell__content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
