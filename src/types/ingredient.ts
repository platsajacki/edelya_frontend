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

export type IngredientFormMode = "create" | "edit" | "copy" | "from-draft"

export interface IngredientFormInitial {
  name?: string
  categoryId?: string
  baseUnit?: DTOBaseUnit
}

export interface DTOIngredientUsageRef {
  id: string
  name: string
}

export interface DTOIngredientUsageShoppingList extends DTOIngredientUsageRef {
  date_from: string
  date_to: string
}

export interface DTOIngredientInUseError {
  detail: string
  dishes: DTOIngredientUsageRef[]
  dishes_total: number
  shopping_lists: DTOIngredientUsageShoppingList[]
  shopping_lists_total: number
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
