<template>
  <section class="l-section l-section--surface">
    <div class="l-container">
      <h2 class="l-title">Знакомо?</h2>
      <div class="landing-problems">
        <LandingIconCard
          v-for="problem in problems"
          :key="problem.title"
          :icon="problem.icon"
          :title="problem.title"
          :text="problem.text"
        />
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import LandingIconCard from "./LandingIconCard.vue"
import IconFork from "@/components/icons/IconFork.vue"
import IconShoppingBag from "@/components/icons/IconShoppingBag.vue"
import IconTrash from "@/components/icons/IconTrash.vue"

const problems = [
  {
    icon: IconFork,
    title: "Каждый вечер один вопрос",
    text: "«Что готовить?» решается заново, хотя рецепты уже есть — просто они не собраны в одном месте.",
  },
  {
    icon: IconShoppingBag,
    title: "Закупка наугад",
    text: "Готовите на несколько дней, а в магазине вспоминаете: «Что купить?» и «Ничего ли не забыли?».",
  },
  {
    icon: IconTrash,
    title: "Продукты пропадают",
    text: "Купленное без плана лежит до конца срока годности и отправляется в мусор вместе с деньгами.",
  },
]
</script>

<style lang="scss" scoped>
.landing-problems {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
  margin-top: 40px;
}

@media (max-width: 1023px) {
  .landing-problems {
    grid-template-columns: 1fr;
  }
}
</style>
