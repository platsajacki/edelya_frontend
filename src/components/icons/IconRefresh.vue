<!-- Refresh / recalculate arrows. Used in ShoppingListDetailPage header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 1v6h6" />
    <path d="M3.51 11a7 7 0 1013.26-3.36A7 7 0 003.51 11z" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 18 },
  height: { default: 18 },
})
</script>
