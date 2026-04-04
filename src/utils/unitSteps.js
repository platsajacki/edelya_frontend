export const UNIT_CONFIG = {
  milligram:   { step: 10,  label: "мг",    shortLabel: "мг" },
  gram:        { step: 50,  label: "г",     shortLabel: "г" },
  kilogram:    { step: 0.1, label: "кг",    shortLabel: "кг" },
  milliliter:  { step: 50,  label: "мл",    shortLabel: "мл" },
  liter:       { step: 0.1, label: "л",     shortLabel: "л" },
  piece:       { step: 1,   label: "шт",    shortLabel: "шт" },
  slice:       { step: 1,   label: "лом.",  shortLabel: "лом." },
  teaspoon:    { step: 1,   label: "ч.л.",  shortLabel: "ч.л." },
  tablespoon:  { step: 1,   label: "ст.л.", shortLabel: "ст.л." },
  glass:       { step: 1,   label: "стак.", shortLabel: "стак." },
  cup:         { step: 1,   label: "чаш.",  shortLabel: "чаш." },
  bunch:       { step: 1,   label: "пуч.",  shortLabel: "пуч." },
  can:         { step: 1,   label: "бан.",  shortLabel: "бан." },
  pinch:       { step: 1,   label: "щеп.",  shortLabel: "щеп." },
  clove:       { step: 1,   label: "зуб.",  shortLabel: "зуб." },
  to_taste:    { step: 0,   label: "",      shortLabel: "" },
}

export function getUnitStep(baseUnit) {
  return UNIT_CONFIG[baseUnit]?.step ?? 1
}

export function getUnitLabel(baseUnit) {
  return UNIT_CONFIG[baseUnit]?.label ?? baseUnit
}
