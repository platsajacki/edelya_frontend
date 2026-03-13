<template>
  <div v-if="loading" style="padding:16px">Загрузка...</div>
  <RouterView v-else />
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useAuthStore } from "./store/auth"

const auth = useAuthStore()
const loading = ref(true)

onMounted(async () => {
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
