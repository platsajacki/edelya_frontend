const now = "2026-03-13T12:00:00Z"

const dishCategory = {
  id: "cat-00000000-0000-0000-0000-000000000001",
  name: "Супы",
  is_active: true,
  created_at: now,
  updated_at: now,
}

const dishBorsch = {
  id: "dish-0000-0000-0000-0000-000000000001",
  owner: "user-0000-0000-0000-0000-000000000001",
  category: dishCategory,
  dish_ingredients: [],
  name: "Борщ",
  description: "",
  is_active: true,
  created_at: now,
  updated_at: now,
}

const dishSchi = {
  id: "dish-0000-0000-0000-0000-000000000002",
  owner: "user-0000-0000-0000-0000-000000000001",
  category: dishCategory,
  dish_ingredients: [],
  name: "Щи",
  description: "",
  is_active: true,
  created_at: now,
  updated_at: now,
}

const dishSyrniki = {
  id: "dish-0000-0000-0000-0000-000000000003",
  owner: "user-0000-0000-0000-0000-000000000001",
  category: { ...dishCategory, id: "cat-00000000-0000-0000-0000-000000000002", name: "Завтраки" },
  dish_ingredients: [],
  name: "Сырники",
  description: "",
  is_active: true,
  created_at: now,
  updated_at: now,
}

// --- Cooking Events ---

const cookingEventBorsch = {
  id: "ce-00000000-0000-0000-0000-000000000001",
  dish: dishBorsch,
  cooking_date: "2026-03-10",
  duration_days: 2,
  start_eating_date: "2026-03-10",
  notes: "",
  created_at: now,
  updated_at: now,
  meal_plan_items: [
    { id: "mpi-0000-0000-0000-0000-000000000001", dish: dishBorsch.id, date: "2026-03-10", cooking_event: "ce-00000000-0000-0000-0000-000000000001", position: 100, is_manual: false, created_at: now, updated_at: now },
    { id: "mpi-0000-0000-0000-0000-000000000002", dish: dishBorsch.id, date: "2026-03-11", cooking_event: "ce-00000000-0000-0000-0000-000000000001", position: 100, is_manual: false, created_at: now, updated_at: now },
  ],
}

const cookingEventSyrniki = {
  id: "ce-00000000-0000-0000-0000-000000000002",
  dish: dishSyrniki,
  cooking_date: "2026-03-11",
  duration_days: 1,
  start_eating_date: "2026-03-11",
  notes: "",
  created_at: now,
  updated_at: now,
  meal_plan_items: [
    { id: "mpi-0000-0000-0000-0000-000000000003", dish: dishSyrniki.id, date: "2026-03-11", cooking_event: "ce-00000000-0000-0000-0000-000000000002", position: 200, is_manual: false, created_at: now, updated_at: now },
  ],
}

const cookingEventSchi = {
  id: "ce-00000000-0000-0000-0000-000000000003",
  dish: dishSchi,
  cooking_date: "2026-03-12",
  duration_days: 3,
  start_eating_date: "2026-03-12",
  notes: "",
  created_at: now,
  updated_at: now,
  meal_plan_items: [
    { id: "mpi-0000-0000-0000-0000-000000000004", dish: dishSchi.id, date: "2026-03-12", cooking_event: "ce-00000000-0000-0000-0000-000000000003", position: 100, is_manual: false, created_at: now, updated_at: now },
    { id: "mpi-0000-0000-0000-0000-000000000005", dish: dishSchi.id, date: "2026-03-13", cooking_event: "ce-00000000-0000-0000-0000-000000000003", position: 100, is_manual: false, created_at: now, updated_at: now },
    { id: "mpi-0000-0000-0000-0000-000000000006", dish: dishSchi.id, date: "2026-03-14", cooking_event: "ce-00000000-0000-0000-0000-000000000003", position: 100, is_manual: false, created_at: now, updated_at: now },
  ],
}

// --- MealPlanItems (full objects with DishRead) ---

const owner = "user-0000-0000-0000-0000-000000000001"

const mealPlanItems = [
  { id: "mpi-0000-0000-0000-0000-000000000001", dish: dishBorsch,   owner, date: "2026-03-10", cooking_event: cookingEventBorsch.id,   position: 100, is_manual: false, created_at: now, updated_at: now },
  { id: "mpi-0000-0000-0000-0000-000000000002", dish: dishBorsch,   owner, date: "2026-03-11", cooking_event: cookingEventBorsch.id,   position: 100, is_manual: false, created_at: now, updated_at: now },
  { id: "mpi-0000-0000-0000-0000-000000000003", dish: dishSyrniki,  owner, date: "2026-03-11", cooking_event: cookingEventSyrniki.id,  position: 200, is_manual: false, created_at: now, updated_at: now },
  { id: "mpi-0000-0000-0000-0000-000000000004", dish: dishSchi,     owner, date: "2026-03-12", cooking_event: cookingEventSchi.id,     position: 100, is_manual: false, created_at: now, updated_at: now },
  { id: "mpi-0000-0000-0000-0000-000000000005", dish: dishSchi,     owner, date: "2026-03-13", cooking_event: cookingEventSchi.id,     position: 100, is_manual: false, created_at: now, updated_at: now },
  { id: "mpi-0000-0000-0000-0000-000000000006", dish: dishSchi,     owner, date: "2026-03-14", cooking_event: cookingEventSchi.id,     position: 100, is_manual: false, created_at: now, updated_at: now },
]

// --- WeekDishes (API response shape) ---

export const mockWeekData = {
  start_week: "2026-03-09",
  end_week: "2026-03-15",
  meal_plan_items: mealPlanItems,
  cooking_events: [cookingEventBorsch, cookingEventSyrniki, cookingEventSchi],
}
