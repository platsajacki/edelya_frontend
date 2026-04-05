<!-- Pencil/edit — arc style (16×16 viewBox). Used in CardDetailSheet, RecipeDishDetail, CookingEventForm -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none">
    <path d="M11.5 2.5a1.414 1.414 0 012 2L5.5 12.5l-3 1 1-3 8-8z"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 16 },
  height: { default: 16 },
})
</script>
