<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-check-icon lucide-check"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  {
    width: 16,
    height: 16,
  }
)
</script>
