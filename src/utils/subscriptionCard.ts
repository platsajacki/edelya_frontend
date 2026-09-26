import type { Component } from "vue"
import IconCalendar from "@/components/icons/IconCalendar.vue"

export interface SubscriptionCardConfig {
  icon: Component
  iconClass: string
  title: string
  description: string
  actionText: string | null
  actionLoadingText?: string
  actionKind?: string
}

function dayWordGenitive(n: number) {
  const abs = Math.abs(n) % 100
  return abs % 10 === 1 && abs !== 11 ? "дня" : "дней"
}

export function trialOfferCard(days: number | null): SubscriptionCardConfig {
  const period = days ? ` в течение ${days} ${dayWordGenitive(days)}` : ""
  return {
    icon: IconCalendar,
    iconClass: "cabinet__card-icon--neutral",
    title: "Планируйте готовку проще",
    description: `Попробуйте все возможности Едели бесплатно${period}.\nКарту привязывать не нужно.`,
    actionText: "Начать",
    actionKind: "trial",
  }
}
