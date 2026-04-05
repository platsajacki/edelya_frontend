<!-- Trash / delete. Used in ShoppingListDetailPage header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 18 18" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2.5 4.5h13" />
    <path d="M5.5 4.5V3a1.5 1.5 0 011.5-1.5h4A1.5 1.5 0 0112.5 3v1.5" />
    <path d="M7 8v5M11 8v5" />
    <path d="M4 4.5l.75 10.5a1.5 1.5 0 001.5 1.5h5.5a1.5 1.5 0 001.5-1.5L14 4.5" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 18 },
  height: { default: 18 },
})
</script>
