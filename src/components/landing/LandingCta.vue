<template>
  <section class="landing-cta">
    <div class="l-container l-container--narrow landing-cta__inner">
      <LandingLogo :width="36" :height="32" class="landing-cta__logo" />
      <h2 class="landing-cta__title">Порядок в готовке и покупках — за пару минут в неделю</h2>
      <p class="l-body landing-cta__text">
        Откройте Еделю в Telegram и спланируйте ближайшую неделю.
      </p>
      <LandingTelegramLink class="l-button landing-cta__button" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import LandingLogo from "./LandingLogo.vue"
import LandingTelegramLink from "./LandingTelegramLink.vue"
</script>

<style lang="scss" scoped>
.landing-cta {
  &__inner {
    padding-block: 96px;
    text-align: center;
  }

  &__logo {
    margin-inline: auto;
    color: var(--color-mint);
  }

  &__title {
    margin-top: 24px;
    font-size: 36px;
    font-weight: 600;
    letter-spacing: -0.025em;
    line-height: 1.25;
    text-wrap: balance;
  }

  &__text {
    margin-top: 16px;
  }

  &__button {
    margin-top: 32px;
  }
}

@media (max-width: 639px) {
  .landing-cta__inner {
    padding-block: 64px;
  }

  .landing-cta__title {
    font-size: 28px;
  }
}
</style>
