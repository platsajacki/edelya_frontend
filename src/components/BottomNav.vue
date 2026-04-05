<template>
  <nav class="bottom-nav">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': isActive(tab.to) }"
    >
      <component :is="tab.icon" class="bottom-nav__icon" width="22" height="22" />
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router"
import IconNavPlanner from "./icons/IconNavPlanner.vue"
import IconNavRecipes from "./icons/IconNavRecipes.vue"
import IconShoppingBag from "./icons/IconShoppingBag.vue"

const route = useRoute()

const tabs = [
  { to: "/", label: "Еделя", icon: IconNavPlanner },
  { to: "/recipes", label: "Блюда", icon: IconNavRecipes },
  { to: "/shopping", label: "Покупки", icon: IconShoppingBag },
]

function isActive(to) {
  return route.path === to
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
  z-index: 900;
}

.bottom-nav__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 16px;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-radius: var(--radius-sm);
  transition: color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.bottom-nav__tab--active {
  color: var(--color-mint);
  background: rgba(138, 99, 181, 0.10);
  border-radius: var(--radius-sm);
}

.bottom-nav__tab--active .bottom-nav__label {
  font-weight: 700;
}

.bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.bottom-nav__label {
  font-size: var(--font-xs);
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
