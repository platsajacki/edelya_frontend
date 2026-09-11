<template>
  <article class="l-card" :class="{ 'l-card--surface': surface }">
    <component :is="icon" :width="28" :height="28" class="l-card__icon" />
    <h3 class="l-card__title">{{ title }}</h3>
    <p class="l-small l-card__text">{{ text }}</p>
  </article>
</template>

<script lang="ts" setup>
import type { Component } from "vue"

defineProps<{
  icon: Component
  title: string
  text: string
  surface?: boolean
}>()
</script>
