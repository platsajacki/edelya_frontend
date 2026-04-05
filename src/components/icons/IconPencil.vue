<!-- Pencil/edit — single unified edit icon. variant="outline" (default) or "filled" -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none">
    <path v-if="variant === 'filled'"
      d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"
      stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
    <path v-else
      d="M11.5 2.5a1.414 1.414 0 012 2L5.5 12.5l-3 1 1-3 8-8z"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:   { default: 16 },
  height:  { default: 16 },
  variant: { default: 'outline' },
})
</script>
