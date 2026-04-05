<!-- Search magnifying glass. Used in RecipesPage search field -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 16 },
  height: { default: 16 },
})
</script>
