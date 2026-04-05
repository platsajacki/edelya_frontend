<!-- Fork / eating utensil. Used in WeekGrid "Ем" column header -->
<template>
  <svg :width="width" :height="height" viewBox="0 0 16 16" fill="none">
    <path d="M5 2v5a2 2 0 002 2h0a2 2 0 002-2V2M6 2v3M8 2v3M7 9v5"
      stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>

<script setup>
defineProps({
  width:  { default: 16 },
  height: { default: 16 },
})
</script>
