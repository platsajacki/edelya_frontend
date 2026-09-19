export const SORT_OPTIONS = [
  { value: "-created_at", label: "Сначала новые" },
  { value: "created_at", label: "Сначала старые" },
  { value: "name", label: "По имени А–Я" },
  { value: "-name", label: "По имени Я–А" },
]

export function sortLabel(value: string): string {
  return SORT_OPTIONS.find((o) => o.value === value)?.label ?? ""
}
