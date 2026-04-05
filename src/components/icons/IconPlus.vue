<!-- Plus / add icon. Used in all three FAB buttons -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 24 },
  height: { default: 24 },
})
</script>
