<template>
  <section class="l-section">
    <div class="l-container">
      <h2 class="l-title">Список покупок собирается сам</h2>
      <div class="landing-shopping">
        <div class="landing-shopping__cards">
          <LandingIconCard
            v-for="feature in features"
            :key="feature.title"
            :icon="feature.icon"
            :title="feature.title"
            :text="feature.text"
            surface
          />
        </div>
        <PhoneShot :screen="screens.shoppingDetail" />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import PhoneShot from "./PhoneShot.vue"
import LandingIconCard from "./LandingIconCard.vue"
import { screens } from "./screens"
import IconBasket from "@/components/icons/IconBasket.vue"
import IconClipboardList from "@/components/icons/IconClipboardList.vue"
import IconRefresh from "@/components/icons/IconRefresh.vue"
import IconListChecks from "@/components/icons/IconListChecks.vue"

const features = [
  {
    icon: IconBasket,
    title: "Ингредиенты суммируются",
    text: "Все готовки за выбранный период складываются в один список с общим количеством.",
  },
  {
    icon: IconClipboardList,
    title: "Ручные позиции",
    text: "Добавленное вами помечается бейджем «вручную» и не стирается при пересчёте.",
  },
  {
    icon: IconRefresh,
    title: "Пересчёт одной кнопкой",
    text: "Поменяли план недели — обновили список, не собирая его заново.",
  },
  {
    icon: IconListChecks,
    title: "Категории",
    text: "Позиции сгруппированы по отделам.",
  },
]
</script>

<style lang="scss" scoped>
.landing-shopping {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 40px;
  margin-top: 40px;

  &__cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
}

@media (max-width: 1023px) {
  .landing-shopping {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 639px) {
  .landing-shopping__cards {
    grid-template-columns: 1fr;
  }
}
</style>
