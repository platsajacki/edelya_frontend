<template>
  <Main v-if="auth.user" :user="auth.user" />
  <main v-else>
      Заходите в Telegram
      <a :href="botUrl" target="_blank">@edelya_bot</a>
  </main>
</template>

<script setup>
import { useAuthStore } from "../store/auth"
import Main from "../components/Main.vue";

const auth = useAuthStore()
const botUrl = import.meta.env.VITE_TELEGRAM_BOT
</script>
