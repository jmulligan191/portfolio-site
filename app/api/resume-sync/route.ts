import { NextRequest, NextResponse } from "next/server"
import { requireApiKey } from "@/lib/tracking/api-key"
import { syncResumeFromSource } from "@/lib/resume-sync/sync"

export const runtime = "nodejs"

// Manually (or externally, e.g. a cron hitting this over HTTP) triggers the
// same GitHub resume-repo check the in-process interval runs periodically
// (see instrumentation.ts). Private: requires the same bearer key as
// /api/resume-exports.
export async function POST(request: NextRequest) {
  const authError = requireApiKey(request)
  if (authError) return authError

  const result = await syncResumeFromSource()
  return NextResponse.json(result)
}
