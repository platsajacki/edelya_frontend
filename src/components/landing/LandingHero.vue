<template>
  <section class="l-section landing-hero">
    <div class="l-container landing-hero__grid">
      <div class="landing-hero__content">
        <p class="l-eyebrow">Мини-приложение в Telegram</p>
        <h1 class="landing-hero__title">
          Планируйте, что готовите и что едите — список покупок соберётся сам
        </h1>
        <p class="l-body landing-hero__description">
          Еделя помогает решить три бытовых вопроса: что приготовить, когда это есть и что для этого
          купить. Вы ведёте свои рецепты и планируете неделю, а приложение суммирует ингредиенты
          всех готовок в один список.
        </p>
        <div class="landing-hero__actions">
          <LandingTelegramLink class="l-button" />
          <div class="landing-hero__notes">
            <span class="l-small">Без регистрации и паролей</span>
            <span class="l-small">Пробный период 14 дней</span>
          </div>
        </div>
      </div>
      <PhoneShot :screen="screens.planner" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import PhoneShot from "./PhoneShot.vue"
import LandingTelegramLink from "./LandingTelegramLink.vue"
import { screens } from "./screens"
</script>

<style lang="scss" scoped>
.landing-hero {
  &__grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    align-items: center;
    gap: 40px;
  }

  &__content {
    max-width: 560px;
  }

  &__title {
    margin-top: 16px;
    font-size: 44px;
    font-weight: 400;
    letter-spacing: -0.025em;
    line-height: 1.15;
  }

  &__description {
    margin-top: 20px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-top: 32px;
  }

  &__notes {
    display: grid;
    gap: 4px;
  }
}

@media (max-width: 1023px) {
  .landing-hero__grid {
    grid-template-columns: 1fr;
  }

  .landing-hero__content {
    max-width: 680px;
  }
}

@media (max-width: 639px) {
  .landing-hero__title {
    font-size: 32px;
  }
}
</style>
