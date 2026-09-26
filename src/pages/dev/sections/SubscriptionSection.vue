<template>
  <DevState v-for="state in states" :key="state.label" :label="state.label">
    <SubscriptionCard :card="state.card" :loading="state.loading" :error="state.error" />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import SubscriptionCard from "@/components/SubscriptionCard.vue"
import { trialOfferCard } from "@/utils/subscriptionCard"

const states = [
  { label: "SubscriptionCard: триал, 14 дней", card: trialOfferCard(14) },
  { label: "SubscriptionCard: триал, 21 день", card: trialOfferCard(21) },
  { label: "SubscriptionCard: триал, длительность неизвестна", card: trialOfferCard(null) },
  { label: "SubscriptionCard: триал, запуск", card: trialOfferCard(14), loading: true },
  {
    label: "SubscriptionCard: триал, ошибка запуска",
    card: trialOfferCard(14),
    error: "Не удалось запустить триал.",
  },
  { label: "SubscriptionCard: загрузка", card: null },
]
</script>
