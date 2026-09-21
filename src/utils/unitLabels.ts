export const UNIT_LABELS = {
  gram: "г",
  kilogram: "кг",
  milligram: "мг",
  milliliter: "мл",
  liter: "л",
  piece: "шт",
  slice: "ломт.",
  teaspoon: "ч. л.",
  tablespoon: "ст. л.",
  glass: "стак.",
  cup: "чашка",
  bunch: "пучок",
  can: "банка",
  pinch: "щеп.",
  clove: "зубч.",
  to_taste: "по вкусу",
}

export const UNITS = [
  { value: "gram", label: "Грамм" },
  { value: "kilogram", label: "Килограмм" },
  { value: "milligram", label: "Миллиграмм" },
  { value: "liter", label: "Литр" },
  { value: "milliliter", label: "Миллилитр" },
  { value: "piece", label: "Штука" },
  { value: "slice", label: "Ломтик" },
  { value: "teaspoon", label: "Чайная ложка" },
  { value: "tablespoon", label: "Столовая ложка" },
  { value: "glass", label: "Стакан" },
  { value: "cup", label: "Чашка" },
  { value: "bunch", label: "Пучок" },
  { value: "can", label: "Банка" },
  { value: "pinch", label: "Щепотка" },
  { value: "clove", label: "Зубчик" },
  { value: "to_taste", label: "По вкусу" },
]

export function unitFullLabel(unit: keyof typeof UNIT_LABELS): string {
  const full = UNITS.find((u) => u.value === unit)?.label ?? unit
  const short = UNIT_LABELS[unit]
  return full.toLowerCase() === short ? full : `${full} (${short})`
}
