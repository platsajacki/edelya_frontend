import type { DTOPaginatedResponse } from "@/types/common"

interface CatalogItem {
  id: string
  name?: string
  owner?: string | null
  category?: { id: string | number }
}

export class Catalog<T extends CatalogItem> {
  constructor(private readonly items: T[]) {}
  add(item: T): T {
    this.items.unshift(item)
    return item
  }
  find(id: string): T {
    return this.items.find((item) => item.id === id) ?? this.items[0]
  }
  page(query = new URLSearchParams()): DTOPaginatedResponse<T> {
    const results = this.items.filter((item) => this.matches(item, query))
    return { count: results.length, next: null, previous: null, results }
  }
  private matches(item: T, query: URLSearchParams): boolean {
    const search = query.get("search")?.toLowerCase() ?? ""
    const category = query.get("category")
    if (search && !item.name?.toLowerCase().includes(search)) return false
    if (query.get("only_owned") && !item.owner) return false
    if (query.get("only_global") && item.owner) return false
    return !category || String(item.category?.id) === category
  }
}
