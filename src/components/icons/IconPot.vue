<!-- Cooking pot. Used in WeekGrid "Готовлю" column header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none">
    <path d="M2 6h12M3 6l1 8h8l1-8M6 6V4a2 2 0 014 0v2"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 16 },
  height: { default: 16 },
})
</script>
