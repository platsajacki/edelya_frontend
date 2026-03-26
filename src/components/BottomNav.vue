<template>
  <nav class="bottom-nav">
    <router-link
      v-for="tab in tabs"
      :key="tab.to"
      :to="tab.to"
      class="bottom-nav__tab"
      :class="{ 'bottom-nav__tab--active': isActive(tab.to) }"
    >
      <span class="bottom-nav__icon" v-html="tab.icon" />
      <span class="bottom-nav__label">{{ tab.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from "vue-router"

const route = useRoute()

const tabs = [
  {
    to: "/",
    label: "Еделя",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="14" x2="14" y2="14"/><line x1="12" y1="12" x2="12" y2="16"/></svg>`,
  },
  {
    to: "/recipes",
    label: "Блюда",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="13" y2="11"/></svg>`,
  },
  {
    to: "/shopping",
    label: "Покупки",
    icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  },
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
