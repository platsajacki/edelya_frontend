<template>
  <section :id="id" class="dev-section">
    <h2 class="dev-section__title">{{ title }}</h2>
    <div class="dev-section__body">
      <slot />
    </div>
  </section>
</template>

<script lang="ts" setup>
defineProps<{
  id: string
  title: string
}>()
</script>

<style lang="scss" scoped>
.dev-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-margin-top: 64px;

  &__title {
    font-size: var(--font-lg);
    color: var(--color-text);
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}
</style>
