<!-- Shopping bag. Used in BottomNav "Покупки" tab and ShoppingPage empty-state illustration -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
    :stroke-width="strokeWidth">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
</template>

<script setup>
defineProps({
  width:       { default: 22 },
  height:      { default: 22 },
  strokeWidth: { default: 1.6 },
})
</script>
