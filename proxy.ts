import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { logSiteVisit } from "@/lib/tracking/repo"
import {
  SESSION_COOKIE,
  RETURN_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  RETURN_MAX_AGE_SECONDS,
  getClientIp,
} from "@/lib/tracking/session"

// Next's "proxy" convention (formerly "middleware") always runs on the
// Node.js runtime, which is what lets this write to sqlite directly. Fine on
// the current VPS deploy; if the site ever moves to an edge/serverless host,
// this needs to become an edge-compatible call (e.g. a fetch to a small
// Node API route, or a KV-backed session store) instead.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/|resumes/).*)"],
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const hasReturnCookie = request.cookies.has(RETURN_COOKIE)
  if (!hasReturnCookie) {
    response.cookies.set(RETURN_COOKIE, "1", {
      maxAge: RETURN_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
  }

  const existingSessionId = request.cookies.get(SESSION_COOKIE)?.value

  if (existingSessionId) {
    // Sliding idle expiry: touch the session cookie on every request.
    response.cookies.set(SESSION_COOKIE, existingSessionId, {
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
    return response
  }

  const sessionId = randomUUID()
  response.cookies.set(SESSION_COOKIE, sessionId, {
    maxAge: SESSION_MAX_AGE_SECONDS,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })

  try {
    const url = request.nextUrl
    logSiteVisit({
      landingPath: url.pathname,
      fullUrl: url.toString(),
      rawQueryParams: Object.fromEntries(url.searchParams),
      ip: getClientIp(request.headers),
      userAgent: request.headers.get("user-agent"),
      referrerHeader: request.headers.get("referer"),
      acceptLanguage: request.headers.get("accept-language"),
      isReturnVisit: hasReturnCookie,
    })
  } catch (error) {
    // Never let tracking failures break navigation.
    console.error("site_visits logging failed:", error)
  }

  return response
}
