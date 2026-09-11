<template>
  <section class="l-section">
    <div class="l-container">
      <h2 class="l-title">Как это работает</h2>
      <div class="landing-steps">
        <article v-for="step in steps" :key="step.number" class="landing-steps__item">
          <PhoneShot :screen="step.screen" small />
          <p class="landing-steps__number">{{ step.number }}</p>
          <h3 class="landing-steps__title">{{ step.title }}</h3>
          <p class="l-small landing-steps__text">{{ step.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import PhoneShot from "./PhoneShot.vue"
import { screens } from "./screens"

const steps = [
  {
    number: "01",
    title: "Добавьте блюдо",
    text: "Своё, из общих рецептов или разобранное нейросетью из обычного текста.",
    screen: screens.dish,
  },
  {
    number: "02",
    title: "Запланируйте готовку",
    text: "Выберите день готовки и отметьте дни, когда будете это есть.",
    screen: screens.cooking,
  },
  {
    number: "03",
    title: "Получите список покупок",
    text: "Ингредиенты всех готовок за период суммируются автоматически.",
    screen: screens.shopping,
  },
  {
    number: "04",
    title: "Отмечайте в магазине",
    text: "Чекбоксы, фильтры «куплено / не куплено», группировка по категориям.",
    screen: screens.shoppingCheck,
  },
]
</script>

<style lang="scss" scoped>
.landing-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-top: 40px;

  &__number {
    margin-top: 24px;
    color: var(--color-mint);
    font-size: var(--font-sm);
    font-weight: 600;
  }

  &__title {
    margin-top: 4px;
    font-size: var(--font-md);
    font-weight: 600;
  }

  &__text {
    margin-top: 8px;
  }
}

@media (max-width: 1023px) {
  .landing-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .landing-steps {
    grid-template-columns: 1fr;
  }
}
</style>
