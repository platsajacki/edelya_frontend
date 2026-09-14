import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createPinia, setActivePinia } from "pinia"
import { usePlanningStore } from "./planning"
import {
  createCookingEvent,
  createMealPlanItem,
  deleteCookingEvent,
  deleteMealPlanItem,
  fetchWeek,
  updateCookingEvent,
  updateMealPlanItem,
} from "../services/planningService"

vi.mock("../services/planningService", () => ({
  fetchWeek: vi.fn(),
  fetchCookingEvent: vi.fn(),
  createCookingEvent: vi.fn(),
  createMealPlanItem: vi.fn(),
  updateCookingEvent: vi.fn(),
  deleteCookingEvent: vi.fn(),
  updateMealPlanItem: vi.fn(),
  deleteMealPlanItem: vi.fn(),
  batchUpdateMealPositions: vi.fn(),
}))

type PlanningStore = ReturnType<typeof usePlanningStore>

const successCases: {
  action: string
  run: (store: PlanningStore) => Promise<unknown>
  message: string
}[] = [
  {
    action: "addCookingEvent",
    run: (store) => store.addCookingEvent({ cooking_date: "2026-09-13" }),
    message: "Готовка создана",
  },
  {
    action: "addMealPlanItem",
    run: (store) => store.addMealPlanItem({ dish: "dish-1", date: "2026-09-13" }),
    message: "Приём пищи добавлен",
  },
  {
    action: "editCookingEvent",
    run: (store) => store.editCookingEvent("cooking-1", { cooking_date: "2026-09-14" }),
    message: "Готовка обновлена",
  },
  {
    action: "removeCookingEvent",
    run: (store) => store.removeCookingEvent("cooking-1"),
    message: "Готовка удалена",
  },
  {
    action: "editMealPlanItem",
    run: (store) => store.editMealPlanItem("meal-1", { date: "2026-09-14" }),
    message: "Приём пищи обновлён",
  },
  {
    action: "removeMealPlanItem",
    run: (store) => store.removeMealPlanItem("meal-1"),
    message: "Приём пищи удалён",
  },
]

describe("planning store toasts", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
    vi.mocked(fetchWeek).mockResolvedValue({
      start_week: "2026-09-07",
      end_week: "2026-09-13",
      meal_plan_items: [],
      cooking_events: [],
    })
    vi.mocked(createCookingEvent).mockResolvedValue({} as never)
    vi.mocked(createMealPlanItem).mockResolvedValue({} as never)
    vi.mocked(updateCookingEvent).mockResolvedValue({} as never)
    vi.mocked(deleteCookingEvent).mockResolvedValue(null)
    vi.mocked(updateMealPlanItem).mockResolvedValue({} as never)
    vi.mocked(deleteMealPlanItem).mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.resetAllMocks()
  })

  it.each(successCases)(
    "$action keeps success toast after week refresh",
    async ({ run, message }) => {
      const store = usePlanningStore()

      await run(store)

      expect(fetchWeek).toHaveBeenCalled()
      expect(store.toast).toBe(message)
    }
  )

  it("hides success toast after 3 seconds", async () => {
    const store = usePlanningStore()

    await store.addCookingEvent({ cooking_date: "2026-09-13" })
    expect(store.toast).toBe("Готовка создана")

    vi.advanceTimersByTime(3000)
    expect(store.toast).toBeNull()
  })

  it("shows error toast and rethrows when creation fails", async () => {
    vi.mocked(createCookingEvent).mockRejectedValue(new Error("boom"))
    const store = usePlanningStore()

    await expect(store.addCookingEvent({ cooking_date: "2026-09-13" })).rejects.toThrow("boom")

    expect(fetchWeek).not.toHaveBeenCalled()
    expect(store.toast).toBe("Не удалось создать готовку")
  })
})
