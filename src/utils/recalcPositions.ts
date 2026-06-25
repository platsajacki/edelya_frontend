const POSITION_STEP = 100

export function recalcPositions<T extends object>(items: T[]): (T & { position: number })[] {
  return items.map((item, i) => ({
    ...item,
    position: (i + 1) * POSITION_STEP,
  }))
}
