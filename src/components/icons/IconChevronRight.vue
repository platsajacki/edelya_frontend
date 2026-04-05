<template>
  <svg :width="width" :height="height" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="7 5 12 10 7 15" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 20 },
  height: { default: 20 },
})
</script>
