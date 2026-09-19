import { describe, expect, it } from "vitest"
import { unitFullLabel } from "./unitLabels"

describe("unitFullLabel", () => {
  it.each([
    ["gram", "Грамм (г)"],
    ["teaspoon", "Чайная ложка (ч. л.)"],
    ["cup", "Чашка"],
    ["to_taste", "По вкусу"],
  ] as const)("%s → %s", (unit, expected) => {
    expect(unitFullLabel(unit)).toBe(expected)
  })
})
