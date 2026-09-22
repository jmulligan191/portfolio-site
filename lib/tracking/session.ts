// Shared cookie names/config used by middleware.ts, the download route, and
// the client-signals route. Keep these in one place so all three agree.

export const SESSION_COOKIE = "cn_sid" // short-lived, first-touch session boundary
export const RETURN_COOKIE = "cn_seen" // long-lived, "has this browser been seen before"

export const SESSION_MAX_AGE_SECONDS = 30 * 60 // 30 min idle expiry, standard analytics convention
export const RETURN_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 // 1 year

export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  const realIp = headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return null
}
