<template>
  <DevState label="DayBadge: default / active" row>
    <DayBadge day="ПН" date="21" />
    <DayBadge day="ВТ" date="22" active />
  </DevState>
  <DevState label="OwnershipBadge: own / shared / short / custom" row>
    <OwnershipBadge is-own />
    <OwnershipBadge :is-own="false" />
    <OwnershipBadge is-own short />
    <OwnershipBadge :is-own="false" short />
    <OwnershipBadge is-own own-label="Личный ингредиент" />
  </DevState>
  <DevState label="AIRecipeUsageBadge: partial">
    <AIRecipeUsageBadge :usage="{ used: 3, limit: 10, remaining: 7 }" />
  </DevState>
  <DevState label="AIRecipeUsageBadge: exhausted">
    <AIRecipeUsageBadge :usage="{ used: 10, limit: 10, remaining: 0 }" />
  </DevState>
  <DevState label="AIRecipeUsageBadge: limit only">
    <AIRecipeUsageBadge :limit="10" />
  </DevState>
</template>

<script lang="ts" setup>
import DevState from "../DevState.vue"
import DayBadge from "@/components/DayBadge.vue"
import OwnershipBadge from "@/components/OwnershipBadge.vue"
import AIRecipeUsageBadge from "@/components/AIRecipeUsageBadge.vue"
</script>
