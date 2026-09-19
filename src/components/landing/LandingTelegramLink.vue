<template>
  <a :href="botUrl" target="_blank" rel="noopener noreferrer" @click="trackClick">
    <slot>Открыть в Telegram</slot>
  </a>
</template>

<script lang="ts" setup>
import { getBotUrl } from "@/utils/botUrl"
import { analytics } from "@/services/analytics"
import { AnalyticsEvent } from "@/constants/analyticsEvents"

const props = defineProps<{ placement: "hero" | "header" | "footer" | "cta" }>()

const botUrl = getBotUrl()

function trackClick() {
  analytics.track(AnalyticsEvent.LANDING_CTA_CLICK, { placement: props.placement })
}
</script>
