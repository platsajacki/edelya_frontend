<template>
  <svg :width="width" :height="height" viewBox="0 0 10 10" fill="none"
    stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="1 5 4 8 9 2" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 10 },
  height: { default: 10 },
})
</script>
