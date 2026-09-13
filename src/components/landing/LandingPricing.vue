<template>
  <section id="pricing" class="l-section">
    <div class="l-container">
      <h2 class="l-title">Тарифы</h2>
      <p class="l-body landing-pricing__intro">
        Сначала — бесплатный пробный период 14 дней. Дальше выбираете тариф: оплата картой,
        помесячно, с автопродлением, отменить можно в кабинете.
      </p>
      <div class="landing-pricing__list">
        <article
          v-for="tariff in tariffs"
          :key="tariff.name"
          class="landing-pricing__card"
          :class="{ 'landing-pricing__card--featured': tariff.featured }"
        >
          <h3 class="landing-pricing__name">{{ tariff.name }}</h3>
          <p class="l-small landing-pricing__subtitle">{{ tariff.subtitle }}</p>
          <p class="landing-pricing__price">
            {{ formatRubles(tariff.price) }}<span class="landing-pricing__period"> / мес</span>
          </p>
          <ul class="landing-pricing__features">
            <li
              v-for="feature in tariff.features"
              :key="feature.label"
              class="landing-pricing__feature"
            >
              <div>
                <span>{{ feature.label }}</span>
                <ul v-if="feature.children?.length" class="landing-pricing__subfeatures">
                  <li v-for="child in feature.children" :key="child">{{ child }}</li>
                </ul>
              </div>
            </li>
          </ul>
        </article>
      </div>
      <div class="landing-pricing__soon">
        <span class="landing-pricing__badge">Скоро</span>
        <span class="l-small">
          Общее пространство — совместное ведение планов и списков с близкими.
        </span>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { formatRubles } from "@/utils/formatRubles"

interface TariffFeature {
  label: string
  children?: string[]
}

interface Tariff {
  name: string
  subtitle: string
  price: number
  featured: boolean
  features: TariffFeature[]
}

const tariffs: Tariff[] = [
  {
    name: "Базовый",
    subtitle: "Для ручного планирования питания",
    price: 99,
    featured: false,
    features: [
      { label: "Личная база блюд и ингредиентов" },
      { label: "Планирование меню по дням" },
      { label: "Автоматический список покупок" },
    ],
  },
  {
    name: "Про",
    subtitle: "Для тех, кто хочет быстрее добавлять блюда",
    price: 129,
    featured: true,
    features: [
      { label: "Всё из тарифа «Базовый»" },
      {
        label: "AI-добавление блюд",
        children: ["Рецепт из текста", "Рецепт из имеющихся продуктов", "Рецепт по идее блюда"],
      },
      { label: "50 AI-рецептов в месяц" },
    ],
  },
]
</script>

<style lang="scss" scoped>
.landing-pricing {
  &__intro {
    max-width: 620px;
    margin-top: 16px;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
    max-width: 760px;
    margin-top: 40px;
  }

  &__card {
    display: grid;
    grid-row: span 4;
    grid-template-rows: subgrid;
    align-items: start;
    row-gap: 0;
    padding: 28px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);

    &--featured {
      border-color: var(--color-mint);
      box-shadow: var(--shadow-card);
    }
  }

  &__name {
    font-size: var(--font-lg);
    font-weight: 600;
  }

  &__subtitle {
    margin-top: 4px;
  }

  &__price {
    margin-top: 20px;
    font-size: 32px;
    font-weight: 600;
    line-height: 1;
  }

  &__period {
    color: var(--color-text-secondary);
    font-size: var(--font-md);
    font-weight: 400;
  }

  &__features {
    display: grid;
    align-content: start;
    gap: 12px;
    margin-top: 24px;
    padding: 0;
    list-style: none;
  }

  &__feature {
    display: flex;
    gap: 12px;
    font-size: var(--font-body);
    line-height: 1.5;

    &::before {
      width: 6px;
      height: 6px;
      flex: 0 0 auto;
      margin-top: 7px;
      border-radius: var(--radius-pill);
      background: var(--color-mint);
      content: "";
    }
  }

  &__subfeatures {
    display: grid;
    gap: 6px;
    margin-top: 8px;
    padding-left: 18px;
    color: var(--color-text-secondary);
    list-style: disc;
  }

  &__soon {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
  }

  &__badge {
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    background: var(--color-mint-alpha-10);
    color: var(--color-mint-dark);
    font-size: var(--font-xs);
    font-weight: 600;
    text-transform: uppercase;
  }
}

@media (max-width: 639px) {
  .landing-pricing__list {
    grid-template-columns: 1fr;
  }
}
</style>
