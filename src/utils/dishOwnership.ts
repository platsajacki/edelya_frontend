export function isDishOwn(dish: { owner?: unknown } | null | undefined): boolean {
  return dish?.owner != null
}
