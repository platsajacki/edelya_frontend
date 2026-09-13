<template>
  <section class="l-section l-section--surface">
    <div class="l-container l-split">
      <PhoneShot :screen="screens.ai" />
      <div>
        <h2 class="l-title">Рецепты: свои, общие и разобранные нейросетью</h2>
        <ul class="landing-recipes__list">
          <li class="landing-recipes__item">
            <IconSearch :width="24" :height="24" class="landing-recipes__icon" />
            <h3 class="landing-recipes__title l-icon-text">Личные и общие</h3>
            <p class="l-small landing-recipes__text">
              Поиск, категории и вкладки «Личные / Общие». Общий рецепт можно скопировать себе и
              изменить под свою семью.
            </p>
          </li>
          <li class="landing-recipes__item">
            <IconSparkles :width="24" :height="24" class="landing-recipes__icon" />
            <h3 class="landing-recipes__title l-icon-text">AI-разбор рецепта</h3>
            <p class="l-small landing-recipes__text">
              Вставьте текст рецепта — получите готовое блюдо с ингредиентами.
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import PhoneShot from "./PhoneShot.vue"
import { screens } from "./screens"
import IconSearch from "@/components/icons/IconSearch.vue"
import IconSparkles from "@/components/icons/IconSparkles.vue"
</script>

<style lang="scss" scoped>
.landing-recipes {
  &__list {
    display: grid;
    gap: 24px;
    margin-top: 32px;
    padding: 0;
    list-style: none;
  }

  &__item {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 4px 16px;
  }

  &__icon {
    color: var(--color-mint-dark);
  }

  &__title {
    font-size: var(--font-md);
    font-weight: 600;
  }

  &__text {
    grid-column: 2;
  }
}
</style>
