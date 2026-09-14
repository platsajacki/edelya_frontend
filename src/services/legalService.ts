import { api } from "../api/client"

interface LegalDocument {
  content: string
}

export function fetchTermsLatest(): Promise<LegalDocument> {
  return api<LegalDocument>("/api/v1/legal/terms-of-service/latest/")
}

export function fetchPrivacyLatest(): Promise<LegalDocument> {
  return api<LegalDocument>("/api/v1/legal/privacy-policy/latest/")
}
