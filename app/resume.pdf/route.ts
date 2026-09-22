import { NextRequest, NextResponse } from "next/server"

// Same as /resume/download, but at a URL a person would guess for "just
// give me the PDF" (mailto links, pasting into a form, etc). Both routes
// redirect to the same generation endpoint.
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/api/resume/download", request.url), 307)
}
