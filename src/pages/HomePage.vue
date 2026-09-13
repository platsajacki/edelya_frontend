<template>
  <Main v-if="auth.user" :user="auth.user" />
  <main v-else class="home-fallback">
    <div class="home-fallback__card">
      <img src="/edelya.svg" alt="Еделя" class="home-fallback__logo" />
      <h1 class="home-fallback__title">Еделя</h1>
      <p class="home-fallback__subtitle">
        Не удалось войти в аккаунт.<br />Попробуйте открыть приложение заново.
      </p>
      <button class="home-fallback__button" @click="reload">Обновить</button>
    </div>
    <footer class="home-fallback__footer">
      <router-link to="/terms" class="home-fallback__legal-link">
        Условия использования
      </router-link>
      <span class="home-fallback__footer-sep">·</span>
      <router-link to="/privacy" class="home-fallback__legal-link">
        Политика конфиденциальности
      </router-link>
    </footer>
  </main>
</template>

<script lang="ts" setup>
import { useAuthStore } from "../store/auth"
import Main from "../components/Main.vue"

const auth = useAuthStore()

function reload() {
  window.location.reload()
}
</script>

<style lang="scss" scoped>
.home-fallback {
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

  &__button {
    margin-top: 4px;
    border: none;
    padding: 12px 24px;
    background: var(--color-mint);
    color: var(--on-primary);
    font-size: var(--font-body);
    font-weight: 600;
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);

    @media (hover: hover) {
      &:hover {
        background: var(--color-mint-hover);
      }
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

    @media (hover: hover) {
      &:hover {
        color: var(--color-text);
      }
    }
  }
}
</style>
