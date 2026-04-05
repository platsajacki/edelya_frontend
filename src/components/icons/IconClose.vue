<template>
  <svg :width="width" :height="height" viewBox="0 0 12 12" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="1" y1="1" x2="11" y2="11" />
    <line x1="11" y1="1" x2="1" y2="11" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 12 },
  height: { default: 12 },
})
</script>
