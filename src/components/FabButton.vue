<template>
  <button class="fab">
    <slot />
  </button>
</template>

<script setup>
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: var(--nav-height);
  right: max(16px, calc((100vw - 480px) / 2 + 16px));
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: var(--color-mint);
  color: var(--on-primary);
  box-shadow: var(--shadow-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-fab);
  transition: background 0.15s, transform 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.fab:hover {
  background: var(--color-mint-hover);
}

.fab:active {
  transform: scale(0.93);
}
</style>
