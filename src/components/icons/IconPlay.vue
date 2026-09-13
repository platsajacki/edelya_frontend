<template>
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-play-icon lucide-play"
  >
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    width?: number
    height?: number
  }>(),
  {
    width: 28,
    height: 28,
  }
)
</script>
