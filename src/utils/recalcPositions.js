const POSITION_STEP = 100

export function recalcPositions(items) {
  return items.map((item, i) => ({
    ...item,
    position: (i + 1) * POSITION_STEP,
  }))
}
