<template>
  <div v-if="loading" style="padding:16px">Загрузка...</div>
  <template v-else>
    <RouterView />
    <BottomNav v-if="auth.user" />
  </template>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "./store/auth"
import BottomNav from "./components/BottomNav.vue"

const auth = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  window.addEventListener("auth:expired", () => auth.logout())

  try {
    await auth.init()
  } catch (err) {
    console.error("Auth failed:", err)
    auth.logout()
  } finally {
    loading.value = false
  }
})
</script>
