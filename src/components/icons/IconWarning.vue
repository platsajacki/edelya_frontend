<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 1.5L14.5 13H1.5L8 1.5z" />
    <line x1="8" y1="6" x2="8" y2="9" />
    <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 14 },
  height: { default: 14 },
})
</script>
