<!-- Filter / funnel lines. Used in RecipesPage filter button -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 4h16M5 10h10M7 16h6" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 20 },
  height: { default: 20 },
})
</script>
