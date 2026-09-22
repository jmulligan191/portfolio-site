import { NextRequest, NextResponse } from "next/server"
import { upsertClientSignals } from "@/lib/tracking/repo"
import { SESSION_COOKIE } from "@/lib/tracking/session"

export const runtime = "nodejs"

// Fire-and-forget beacon (navigator.sendBeacon or a fetch with no awaited
// response) fired on page load. Tier-2 signals only — never on the critical
// path of the zero-JS resume download itself. Silently no-ops if there's no
// session cookie yet or the payload is malformed.
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value
  if (!sessionId) {
    return NextResponse.json({ ok: true })
  }

  try {
    const body = await request.json()
    const timezone = typeof body?.timezone === "string" ? body.timezone.slice(0, 100) : null
    const language = typeof body?.language === "string" ? body.language.slice(0, 40) : null
    upsertClientSignals(sessionId, timezone, language)
  } catch {
    // Ignore malformed beacons.
  }

  return NextResponse.json({ ok: true })
}
