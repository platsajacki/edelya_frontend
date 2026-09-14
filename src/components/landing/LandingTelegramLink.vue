<template>
  <a :href="botUrl" target="_blank" rel="noopener noreferrer">
    <slot>Открыть в Telegram</slot>
  </a>
</template>

<script lang="ts" setup>
import { getBotUrl } from "@/utils/botUrl"

const botUrl = getBotUrl()
</script>
