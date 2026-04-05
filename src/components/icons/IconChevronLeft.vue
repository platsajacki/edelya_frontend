<template>
  <svg :width="width" :height="height" viewBox="0 0 20 20" fill="none">
    <path d="M12.5 15L7.5 10L12.5 5"
      stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 20 },
  height: { default: 20 },
})
</script>
