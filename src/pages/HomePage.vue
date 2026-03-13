<template>
  <main style="padding:16px;font-family:system-ui">

    <h1>Еделя</h1>

    <p v-if="auth.user">Привет, {{ auth.user.first_name }}</p>

    <p v-else>
      Заходите в Telegram
      <a :href="botUrl" target="_blank">@edelya_bot</a>
    </p>

  </main>
</template>

<script setup>
import { useAuthStore } from "../store/auth"

const auth = useAuthStore()
const botUrl = import.meta.env.VITE_TELEGRAM_BOT
</script>
