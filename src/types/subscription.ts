export type DTOSubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired"

export type DTOBillingPeriod = "monthly" | "yearly"

export interface DTOTariff {
  id: string
  name: string
  price: string
  billing_period: DTOBillingPeriod
  description: string | null
  description_items: string[] | null
  trial_days: number
  soon: boolean
  is_trial_tariff: boolean
  sort_order: number
  can_use_base_features: boolean
  can_create_ai_recipes: boolean
  can_have_common_space: boolean
}

export interface DTOSubscription {
  id: string
  status: DTOSubscriptionStatus
  tariff: DTOTariff
  pending_tariff: DTOTariff
  trial_started_at: string | null
  days_in_trial: number
  trial_ended_at: string | null
  current_period_start: string | null
  current_period_end: string | null
  auto_renew: boolean
  cancelled_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DTOPaymentMethod {
  id: string
  card_type: string | null
  card_last4: string | null
  title: string | null
  is_active: boolean
}

export interface DTOAIRecipeUsage {
  used: number
  limit: number
  remaining: number
}

export interface DTOSubscriptionDictionary {
  default_trial_days: number
  grace_period_days: number
  ai_recipe_limit_per_period: number
}
