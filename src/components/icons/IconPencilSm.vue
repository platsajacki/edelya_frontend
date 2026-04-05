<!-- Pencil/edit — small arc style (14×14 viewBox). Used in DishForm ingredient rows -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 14 14" fill="none">
    <path d="M8.5 2.5a1 1 0 011.415 0l1.585 1.585a1 1 0 010 1.415L4.5 12.5l-3 .5.5-3z"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 12 },
  height: { default: 12 },
})
</script>
