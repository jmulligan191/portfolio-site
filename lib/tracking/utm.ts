const UTM_SOURCE = "jmulligan191"

export interface BuildTrackedUrlInput {
  medium: string
  campaign: string
  term?: string
  content?: string
  /** Path on the site this link should land on, e.g. "/" or "/resume/download". Defaults to "/". */
  path?: string
  baseUrl?: string
}

/**
 * Single shared builder for every attributable link the site or local
 * tooling ever mints (resume PDF link, QR codes, future channels) so they
 * all land in the same utm_codes table with the same conventions.
 */
export function buildTrackedUrl({ medium, campaign, term, content, path, baseUrl }: BuildTrackedUrlInput): string {
  const origin = baseUrl ?? `https://${process.env.NEXT_PUBLIC_DOMAIN || "jmulligan191.com"}`
  const url = new URL(path ?? "/", origin)
  url.searchParams.set("utm_source", UTM_SOURCE)
  url.searchParams.set("utm_medium", medium)
  url.searchParams.set("utm_campaign", campaign)
  if (term) url.searchParams.set("utm_term", term)
  if (content) url.searchParams.set("utm_content", content)
  return url.toString()
}

export const DEFAULT_RESUME_CAMPAIGN = "default"
