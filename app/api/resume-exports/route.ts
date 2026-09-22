import { NextRequest, NextResponse } from "next/server"
import { requireApiKey } from "@/lib/tracking/api-key"
import { insertUtmCode, listUtmCodes } from "@/lib/tracking/repo"

export const runtime = "nodejs"

interface ResumeExportPayload {
  export_id: string
  company?: string
  position?: string
  resume_version?: string
  git_commit?: string
  exported_at?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  label?: string
  file_format?: string
  local_file_path?: string
  metadata?: Record<string, unknown>
}

// GET /api/resume-exports — list every resume export/UTM code on record
// (local Flow-A stamps, site Flow-B downloads, and QR/other codes), newest
// first. Private: requires the same bearer key as POST. Pass ?ids=true to
// get back just the list of ids instead of full rows.
export async function GET(request: NextRequest) {
  const authError = requireApiKey(request)
  if (authError) return authError

  const idsOnly = new URL(request.url).searchParams.get("ids") === "true"
  const rows = listUtmCodes()

  if (idsOnly) {
    return NextResponse.json({ ids: rows.map((row) => row.id) })
  }
  return NextResponse.json({ exports: rows })
}

// Called by the resume repo's local CLI (export/cli.py) after a successful
// local Flow-A stamp, so the site's DB has a record of every resume ever
// sent out, not just site-triggered downloads. Best-effort from the
// caller's side — the local export always succeeds regardless of whether
// this call does.
export async function POST(request: NextRequest) {
  const authError = requireApiKey(request)
  if (authError) return authError

  let payload: ResumeExportPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!payload.export_id) {
    return NextResponse.json({ error: "export_id is required" }, { status: 400 })
  }

  try {
    insertUtmCode({
      id: payload.export_id,
      utm_medium: payload.utm_medium ?? "resume",
      utm_campaign: payload.utm_campaign ?? payload.export_id,
      utm_term: payload.utm_term ?? null,
      utm_content: payload.utm_content ?? null,
      purpose: "resume-job-tailored",
      label: payload.label ?? null,
      resume_version: payload.resume_version ?? null,
      git_commit: payload.git_commit ?? null,
      company: payload.company ?? null,
      position: payload.position ?? null,
      source: "local",
      file_format: payload.file_format ?? "pdf",
      local_file_path: payload.local_file_path ?? null,
      metadata: payload.metadata ?? null,
      synced_from_local: true,
    })
  } catch (error) {
    console.error("Failed to record local resume export:", error)
    return NextResponse.json({ error: "Failed to record export" }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
