import { api } from "../api/client"

export async function fetchTermsLatest() {
  return api("/api/v1/legal/terms-of-service/latest/")
}

export async function fetchPrivacyLatest() {
  return api("/api/v1/legal/privacy-policy/latest/")
}
