<template>
  <nav class="bottom-nav">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': isActive(tab.to) }"
    >
      <span class="bottom-nav__tab-inner">
        <component :is="tab.icon" class="bottom-nav__icon" width="22" height="22" />
        <span class="bottom-nav__label">{{ tab.label }}</span>
      </span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router"
import IconNavPlanner from "./icons/IconNavPlanner.vue"
import IconNavRecipes from "./icons/IconNavRecipes.vue"
import IconShoppingBag from "./icons/IconShoppingBag.vue"
import IconProfile from "./icons/IconProfile.vue"

const route = useRoute()

const tabs = [
  { to: "/", label: "Еделя", icon: IconNavPlanner },
  { to: "/recipes", label: "Блюда", icon: IconNavRecipes },
  { to: "/shopping", label: "Покупки", icon: IconShoppingBag },
  { to: "/cabinet", label: "Кабинет", icon: IconProfile },
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
  background: var(--color-surface-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-border);
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom, 0px));
  z-index: var(--z-nav);
}

.bottom-nav__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px 8px;
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
  -webkit-tap-highlight-color: transparent;
  min-width: 0;
}

.bottom-nav__tab-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 4px 14px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.bottom-nav__tab:hover:not(.bottom-nav__tab--active) .bottom-nav__tab-inner {
  background: var(--color-empty);
}

.bottom-nav__tab--active {
  color: var(--color-mint);
}

.bottom-nav__tab--active .bottom-nav__tab-inner {
  background: var(--color-mint-alpha-10);
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
