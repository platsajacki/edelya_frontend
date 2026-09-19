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

export interface DTOIngredientCategory {
  id: string
  name: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface DTOIngredient {
  id: string
  owner?: string | null
  name: string
  base_unit: DTOBaseUnit
  is_active: boolean
  category: DTOIngredientCategory
  created_at: string
  updated_at: string
}
