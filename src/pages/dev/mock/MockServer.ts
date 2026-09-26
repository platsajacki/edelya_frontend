type RouteHandler = (params: string[], query: URLSearchParams, body: unknown) => unknown

interface MockRoute {
  method: string
  pattern: RegExp
  handler: RouteHandler
}

export class MockResponse {
  constructor(
    readonly status: number,
    readonly body: unknown
  ) {}
}

export class MockServer {
  private readonly routes: MockRoute[] = []
  private originalFetch: typeof window.fetch | null = null
  constructor(private readonly prefix: string) {}
  on(method: string, path: string, handler: RouteHandler): this {
    this.routes.push({ method, pattern: new RegExp(`^${this.prefix}${path}$`), handler })
    return this
  }
  install() {
    if (this.originalFetch) return
    this.originalFetch = window.fetch
    window.fetch = (input, init) => this.dispatch(input, init)
  }
  uninstall() {
    if (!this.originalFetch) return
    window.fetch = this.originalFetch
    this.originalFetch = null
  }
  private async dispatch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
    const url = new URL(input instanceof Request ? input.url : String(input), location.origin)
    const method = (init.method ?? "GET").toUpperCase()
    const match = this.match(method, url.pathname)
    if (!match) return this.originalFetch!(input, init)
    const result = match.route.handler(match.params, url.searchParams, this.parseBody(init.body))
    return this.respond(result instanceof MockResponse ? result : new MockResponse(200, result))
  }
  private match(method: string, path: string) {
    for (const route of this.routes) {
      const found = route.method === method ? path.match(route.pattern) : null
      if (found) return { route, params: found.slice(1) }
    }
    return null
  }
  private parseBody(body: BodyInit | null | undefined): unknown {
    return typeof body === "string" ? JSON.parse(body) : null
  }
  private respond({ status, body }: MockResponse): Response {
    if (body === null) return new Response(null, { status: 204 })
    const headers = { "Content-Type": "application/json" }
    return new Response(JSON.stringify(body), { status, headers })
  }
}
