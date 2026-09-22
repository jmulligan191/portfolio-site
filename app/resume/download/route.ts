import { NextRequest, NextResponse } from "next/server"

// Stable, memorable public URL for QR codes / business cards / direct links.
// Immediately redirects to the generation endpoint (/api/resume/download),
// which does the actual per-visitor stamping and streams the PDF back with
// Content-Disposition: attachment — so the browser prompts a download
// regardless of platform. 307 (not 301/308) so it's never cached as
// permanent and every hit re-triggers fresh generation.
export function GET(request: NextRequest) {
  // `request.url` reflects the port Next itself is bound to, not the
  // Host the client actually connected to — wrong behind a reverse proxy
  // (nginx/Cloudflare), where it'd redirect to the internal localhost:PORT.
  // Trust the forwarded headers the proxy sets instead.
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") ?? "https"
  const origin = host ? `${proto}://${host}` : request.url

  return NextResponse.redirect(new URL("/api/resume/download", origin), 307)
}
