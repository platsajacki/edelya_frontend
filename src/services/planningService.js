import { api } from "../api/client"

export function fetchWeek(year, week) {
  return api(`/api/v1/planning/year/${year}/week/${week}/`)
}
