<template>
  <main style="padding: 16px; font-family: system-ui;">
    <h1>Еделя</h1>
    <p v-if="name">Привет, {{ name }}!</p>
    <p v-else>Заходите в Telegram <a href="https://t.me/edelya_planing_bot" target="_blank">@edelya_bot</a>, чтобы начать работу с приложением.</p>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";

const name = ref("");

onMounted(() => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return;
  tg.ready();
  tg.expand();
  name.value = tg.initDataUnsafe?.user?.first_name ?? "";
});
</script>