import type { DTOBaseUnit } from "@/types/dish.ts"

export interface DTOIngredientCategory {
  id: string
  name: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface DTOIngredient {
  id: string
  name: string
  base_unit: DTOBaseUnit
  is_active: boolean
  category: DTOIngredientCategory
  created_at: string
  updated_at: string
}

export interface DTOShoppingList {
  id: string
  name: string
  date_from: string
  date_to: string
  created_at: string
  updated_at: string
}

export interface DTOShoppingListItem {
  id: string
  shopping_list: string
  ingredient: DTOIngredient
  amount: string
  owner: string
  is_checked: boolean
  checked_at: string | null
  is_manual: boolean
  position: number
  created_at: string
  updated_at: string
}
