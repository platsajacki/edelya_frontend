<template>
  <Main v-if="auth.user" :user="auth.user" />
  <main v-else class="home-landing">
    <div class="home-landing__card">
      <img src="/edelya.svg" alt="Еделя" class="home-landing__logo" />
      <h1 class="home-landing__title">Еделя</h1>
      <p class="home-landing__subtitle">Планировщик питания.<br />Доступен в Telegram Mini App</p>
      <a :href="botUrl" target="_blank" rel="noopener noreferrer" class="home-landing__bot-link">
        @edelya_plan_bot
      </a>
    </div>
    <footer class="home-landing__footer">
      <router-link to="/terms" class="home-landing__legal-link">
        Условия использования
      </router-link>
      <span class="home-landing__footer-sep">·</span>
      <router-link to="/privacy" class="home-landing__legal-link">
        Политика конфиденциальности
      </router-link>
    </footer>
  </main>
</template>

<script lang="ts" setup>
import { useAuthStore } from "../store/auth"
import Main from "../components/Main.vue"

const auth = useAuthStore()
const botUsername = window.__APP_CONFIG__?.telegramBot ?? import.meta.env.VITE_TELEGRAM_BOT
const botUrl = `https://t.me/${botUsername}`
</script>

<style lang="scss" scoped>
.home-landing {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 40px;
  background: var(--color-bg);

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    text-align: center;
    flex: 1;
    justify-content: center;
  }

  &__logo {
    width: 64px;
    height: 56px;
  }

  &__title {
    font-size: var(--font-display);
    font-weight: 700;
    color: var(--color-text);
    margin: 0;
  }

  &__subtitle {
    font-size: var(--font-body);
    color: var(--color-text-secondary);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  &__bot-link {
    display: inline-block;
    margin-top: 4px;
    padding: 12px 24px;
    background: var(--color-mint);
    color: var(--on-primary);
    font-size: var(--font-body);
    font-weight: 600;
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: background 0.15s;

    &:hover {
      background: var(--color-mint-hover);
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  &__footer-sep {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
  }

  &__legal-link {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--color-text);
    }
  }
}
</style>
