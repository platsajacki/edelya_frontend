export type DTOBaseUnit =
  | "milligram"
  | "gram"
  | "kilogram"
  | "milliliter"
  | "liter"
  | "piece"
  | "slice"
  | "teaspoon"
  | "tablespoon"
  | "glass"
  | "cup"
  | "bunch"
  | "can"
  | "pinch"
  | "clove"
  | "to_taste"

export interface DTODishCategory {
  id: number
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
  category: string
  created_at: string
  updated_at: string
}

export interface DTODishIngredient {
  id: string
  dish: string
  ingredient: DTOIngredient
  is_optional?: boolean
  amount: string
  created_at: string
  updated_at: string
}

export interface DTODish {
  id: string
  owner?: string | null
  category: DTODishCategory
  dish_ingredients: DTODishIngredient[]
  name: string
  recipe?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export type DTOAIDraftStatus = "processing" | "parsed" | "dish_created" | "failed"

export interface DTOAIDraft {
  id: string
  source_text: string
  status: DTOAIDraftStatus
  payload: Record<string, unknown> | null
  created_dish: string | null
  validation_errors: Record<string, unknown>
  created_at: string
  updated_at: string
}
