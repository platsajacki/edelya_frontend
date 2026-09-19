import type { AnalyticsEventName } from "@/constants/analyticsEvents"
import type { DTOTariff } from "@/types/subscription"

type AnalyticsParams = Record<string, string | number | boolean>

const GTAG_URL = "https://www.googletagmanager.com/gtag/js"
const CURRENCY = "RUB"

class Analytics {
  private get measurementId(): string {
    return globalThis.window?.__APP_CONFIG__?.gaId ?? ""
  }

  init(): void {
    if (!this.measurementId) return
    this.loadScript()
    window.gtag?.("js", new Date())
    window.gtag?.("config", this.measurementId)
  }

  track(event: AnalyticsEventName, params: AnalyticsParams = {}): void {
    if (!this.measurementId) return
    window.gtag?.("event", event, params)
  }

  trackTariff(event: AnalyticsEventName, tariff: DTOTariff): void {
    this.track(event, { tariff_id: tariff.id, value: Number(tariff.price), currency: CURRENCY })
  }

  private loadScript(): void {
    const script = document.createElement("script")
    script.async = true
    script.src = `${GTAG_URL}?id=${this.measurementId}`
    document.head.appendChild(script)
  }
}

export const analytics = new Analytics()
