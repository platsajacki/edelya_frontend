<!-- Edit — filled polygon style (18×18 viewBox). Used in ShoppingListDetailPage header edit button -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 3l5 5-9.5 9.5H1v-4.5z" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 18 },
  height: { default: 18 },
})
</script>
