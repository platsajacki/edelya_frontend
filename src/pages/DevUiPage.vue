<template>
  <div class="page-layout dev-ui">
    <nav class="dev-ui__nav">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        class="dev-ui__link"
      >
        {{ section.title }}
      </a>
    </nav>
    <DevSection
      v-for="section in sections"
      :id="section.id"
      :key="section.id"
      :title="section.title"
    >
      <component :is="section.component" />
    </DevSection>
  </div>
</template>

<script setup lang="ts">
import DevSection from "./dev/DevSection.vue"
import BadgesSection from "./dev/sections/BadgesSection.vue"
import ControlsSection from "./dev/sections/ControlsSection.vue"
import CardsSection from "./dev/sections/CardsSection.vue"
import ShoppingItemsSection from "./dev/sections/ShoppingItemsSection.vue"
import PlannerSection from "./dev/sections/PlannerSection.vue"
import SheetsSection from "./dev/sections/SheetsSection.vue"
import DetailsSection from "./dev/sections/DetailsSection.vue"
import FormsSection from "./dev/sections/FormsSection.vue"
import AIDraftSection from "./dev/sections/AIDraftSection.vue"
import PickersSection from "./dev/sections/PickersSection.vue"
import ScreensSection from "./dev/sections/ScreensSection.vue"
import AppShellSection from "./dev/sections/AppShellSection.vue"
import SubscriptionSection from "./dev/sections/SubscriptionSection.vue"
import { useDevApi } from "./dev/mock/useDevApi"

const sections = [
  { id: "badges", title: "Бейджи", component: BadgesSection },
  { id: "controls", title: "Контролы", component: ControlsSection },
  { id: "cards", title: "Карточки", component: CardsSection },
  { id: "shopping-items", title: "Покупки", component: ShoppingItemsSection },
  { id: "planner", title: "Планировщик", component: PlannerSection },
  { id: "sheets", title: "Модалки", component: SheetsSection },
  { id: "details", title: "Детали", component: DetailsSection },
  { id: "forms", title: "Формы", component: FormsSection },
  { id: "ai-draft", title: "AI-рецепт", component: AIDraftSection },
  { id: "pickers", title: "Поиск блюд", component: PickersSection },
  { id: "subscription", title: "Подписка", component: SubscriptionSection },
  { id: "screens", title: "Экраны", component: ScreensSection },
  { id: "app-shell", title: "Оболочка", component: AppShellSection },
]

useDevApi()
</script>

<style lang="scss" scoped>
.dev-ui {
  gap: 28px;
  padding: var(--page-padding-top) 16px calc(var(--nav-height) + 24px);

  &__nav {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px 0;
    background: var(--color-bg);
  }

  &__link {
    flex-shrink: 0;
    padding: 6px 12px;
    border-radius: var(--radius-pill);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-sm);
    text-decoration: none;
  }
}
</style>
