import { NextRequest, NextResponse } from "next/server"

// Stable, memorable public URL for QR codes / business cards / direct links.
// Immediately redirects to the generation endpoint (/api/resume/download),
// which does the actual per-visitor stamping and streams the PDF back with
// Content-Disposition: attachment — so the browser prompts a download
// regardless of platform. 307 (not 301/308) so it's never cached as
// permanent and every hit re-triggers fresh generation.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/resume/download", request.url), 307)
}
