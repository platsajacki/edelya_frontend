import type { Directive } from "vue"
import { analytics } from "@/services/analytics"
import { AnalyticsEvent } from "@/constants/analyticsEvents"

const VIEWPORT_MIDDLE = "0px 0px -50% 0px"

const observers = new WeakMap<HTMLElement, IntersectionObserver>()

const observe = (el: HTMLElement, section: string) => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return
      analytics.track(AnalyticsEvent.LANDING_SECTION_VIEW, { section })
      observer.disconnect()
    },
    { rootMargin: VIEWPORT_MIDDLE }
  )
  observer.observe(el)
  observers.set(el, observer)
}

export const TrackViewDirective: Directive<HTMLElement, string> = {
  mounted: (el, { value }) => observe(el, value),
  unmounted: (el) => observers.get(el)?.disconnect(),
}
