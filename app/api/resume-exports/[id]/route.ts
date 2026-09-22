import { NextRequest, NextResponse } from "next/server"
import { requireApiKey } from "@/lib/tracking/api-key"
import { getUtmCodeById } from "@/lib/tracking/repo"

export const runtime = "nodejs"

// GET /api/resume-exports/:id — full record for one export_id/UTM code,
// including visitor PII (IP, UA, referrer, company/position if known).
// Private: requires the same bearer key as the rest of /api/resume-exports.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireApiKey(request)
  if (authError) return authError

  const { id } = await params
  const row = getUtmCodeById(id)
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({ export: row })
}
