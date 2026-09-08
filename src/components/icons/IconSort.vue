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
    class="lucide lucide-arrow-down-up-icon lucide-arrow-down-up"
  >
    <path d="m3 16 4 4 4-4" />
    <path d="M7 20V4" />
    <path d="m21 8-4-4-4 4" />
    <path d="M17 4v16" />
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
