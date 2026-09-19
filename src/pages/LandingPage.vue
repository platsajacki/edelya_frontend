<template>
  <LandingHero />
  <LandingProblems />
  <LandingPlanner v-track-view="'planner'" />
  <LandingShopping v-track-view="'shopping'" />
  <LandingRecipes v-track-view="'recipes'" />
  <LandingPricing v-track-view="'pricing'" />
  <LandingFaq v-track-view="'faq'" />
  <LandingCta v-track-view="'cta'" />
</template>

<script lang="ts" setup>
import { TrackViewDirective as vTrackView } from "@/directives/trackView"
import LandingHero from "@/components/landing/LandingHero.vue"
import LandingProblems from "@/components/landing/LandingProblems.vue"
import LandingPlanner from "@/components/landing/LandingPlanner.vue"
import LandingShopping from "@/components/landing/LandingShopping.vue"
import LandingRecipes from "@/components/landing/LandingRecipes.vue"
import LandingPricing from "@/components/landing/LandingPricing.vue"
import LandingFaq from "@/components/landing/LandingFaq.vue"
import LandingCta from "@/components/landing/LandingCta.vue"
</script>
