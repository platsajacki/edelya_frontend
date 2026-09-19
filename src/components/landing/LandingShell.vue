<template>
  <div class="landing-shell">
    <a href="#main" class="landing-skip-link" @click.prevent="mainEl?.focus()">
      Перейти к содержимому
    </a>
    <header class="landing-header">
      <div class="l-container landing-header__inner">
        <RouterLink to="/" class="landing-brand" aria-label="Еделя — на главную">
          <LandingLogo :width="28" :height="25" class="landing-brand__mark" />
          <span class="landing-brand__name l-icon-text">деля</span>
        </RouterLink>
        <LandingTelegramLink class="l-link" placement="header" />
      </div>
    </header>

    <main id="main" ref="mainEl" class="landing-shell__main" tabindex="-1">
      <slot />
    </main>

    <footer class="landing-footer">
      <div class="l-container landing-footer__inner">
        <div>
          <RouterLink to="/" class="landing-brand" aria-label="Еделя — на главную">
            <LandingLogo :width="24" :height="21" class="landing-brand__mark" />
            <span class="landing-brand__name landing-brand__name--sm l-icon-text">деля</span>
          </RouterLink>
          <p class="l-small landing-footer__description">
            Планировщик домашнего питания и покупок в Telegram.
          </p>
          <p class="landing-footer__legal">
            Email: <a href="mailto:edelya@corpdi.com">edelya@corpdi.com</a><br />
            Самозанятый Менюхов Вячеслав Вадимович<br />
            ИНН: 531700890106
          </p>
        </div>
        <nav class="landing-footer__nav" aria-label="Ссылки в подвале">
          <RouterLink to="/terms" class="landing-footer__link">Условия использования</RouterLink>
          <RouterLink to="/privacy" class="landing-footer__link">
            Политика конфиденциальности
          </RouterLink>
          <LandingTelegramLink class="l-link" placement="footer" />
        </nav>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
import LandingLogo from "./LandingLogo.vue"
import LandingTelegramLink from "./LandingTelegramLink.vue"

const mainEl = ref<HTMLElement | null>(null)
</script>

<style lang="scss">
@use "../../styles/landing.scss";
</style>

<style lang="scss" scoped>
.landing-shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background: var(--color-bg);

  &__main {
    flex: 1;

    &:focus-visible {
      outline: none;
    }
  }
}

.landing-skip-link {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-mint);
  color: var(--on-primary);
  font-size: var(--font-body);
  font-weight: 600;
  text-decoration: none;
  transform: translateY(calc(-100% - 16px));

  &:focus-visible {
    transform: none;
  }
}

.landing-header {
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);

  &__inner {
    display: flex;
    min-height: 57px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
}

.landing-brand {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: 1px;
  text-decoration: none;

  &__mark {
    color: var(--color-mint);
  }

  &__name {
    color: var(--color-mint);
    font-size: var(--font-md);
    font-weight: 600;
    padding-top: 20%;

    &--lg {
      font-size: var(--font-body);
    }
  }
}

.landing-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);

  &__inner {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 32px;
    padding-block: 40px;
  }

  &__description {
    margin-top: 12px;
  }

  &__legal {
    margin-top: 16px;
    color: var(--color-text-secondary);
    font-size: var(--font-2xs);
    line-height: 1.5;

    a {
      color: inherit;
    }
  }

  &__nav {
    display: grid;
    align-content: start;
    gap: 8px;
  }

  &__link {
    display: inline-flex;
    min-height: 44px;
    align-items: center;
    color: var(--color-text-secondary);
    font-size: var(--font-body);
    text-decoration: none;
    transition: color var(--transition-normal);

    @media (hover: hover) {
      &:hover {
        color: var(--color-text);
      }
    }
  }
}

@media (max-width: 639px) {
  .landing-footer__inner {
    grid-template-columns: 1fr;
  }
}
</style>
