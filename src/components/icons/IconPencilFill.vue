<!-- Pencil/edit — filled polygon style (16×16 viewBox). Used in MealPlanItemForm selected-dish button -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none">
    <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z"
      stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 16 },
  height: { default: 16 },
})
</script>
