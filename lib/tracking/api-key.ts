import { createHash, timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"

// The local resume repo authenticates to POST /api/resume-exports with a
// long-lived bearer key. Only its SHA-256 hash is ever stored server-side
// (RESUME_EXPORT_API_KEY_HASH); the plaintext key lives only in the resume
// repo's local .env.
export function verifyApiKey(presentedKey: string | null): boolean {
  const expectedHash = process.env.RESUME_EXPORT_API_KEY_HASH
  if (!presentedKey || !expectedHash) return false

  const presentedHash = createHash("sha256").update(presentedKey).digest("hex")
  const a = Buffer.from(presentedHash, "hex")
  const b = Buffer.from(expectedHash, "hex")
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : null
}

/**
 * Shared guard for every private (owner-only) endpoint under /api/resume-exports.
 * Returns a 401 NextResponse to return immediately if unauthorized, or null
 * if the request's bearer token is valid.
 */
export function requireApiKey(request: NextRequest): NextResponse | null {
  const token = extractBearerToken(request.headers.get("authorization"))
  if (!verifyApiKey(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
