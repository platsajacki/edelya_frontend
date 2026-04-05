<!-- Sort icon with directional arrow. Used in ShoppingPage list header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
    <line x1="2" y1="4" x2="10" y2="4" />
    <line x1="2" y1="8" x2="8" y2="8" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <polyline v-if="ascending" points="13 11 13 5 11 7" />
    <polyline v-else points="13 5 13 11 11 9" />
  </svg>
</template>

<script setup>
defineProps({
  width:     { default: 16 },
  height:    { default: 16 },
  ascending: { type: Boolean, default: true },
})
</script>
