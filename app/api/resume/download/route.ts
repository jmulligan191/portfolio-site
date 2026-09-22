import { NextRequest, NextResponse } from "next/server"
import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join, basename } from "path"
import { randomUUID } from "crypto"
import { resumes } from "@/content/config"
import { stampAndRewrite } from "@/lib/tracking/pdf-stamp"
import { buildResumeBranding } from "@/lib/tracking/resume-branding"
import { buildTrackedUrl } from "@/lib/tracking/utm"
import { insertUtmCode, getClientSignals } from "@/lib/tracking/repo"
import { SESSION_COOKIE, RETURN_COOKIE, getClientIp } from "@/lib/tracking/session"
import { isRateLimited } from "@/lib/tracking/rate-limit"
import { resolveCurrentResumeFilename } from "@/lib/resume-sync/sync"

export const runtime = "nodejs"

const DOWNLOAD_FILENAME = "John Mulligan - Resume.pdf"

function configuredResumeFilename(): string | null {
  const current = resumes.find((r) => r.isCurrent) ?? resumes[0]
  return current ? basename(current.filename) : null
}

// Prefers whatever the GitHub resume-repo sync last downloaded; falls back
// to the manually-curated content/config.ts entry if no sync has run yet.
async function currentResumePath(): Promise<string | null> {
  const filename = await resolveCurrentResumeFilename(configuredResumeFilename())
  return filename ? join(process.cwd(), "public", "resumes", filename) : null
}

function pdfResponse(bytes: Uint8Array | Buffer) {
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${DOWNLOAD_FILENAME}"`,
      "Content-Length": String(bytes.length),
    },
  })
}

async function serveStaticFallback(): Promise<NextResponse> {
  const filepath = await currentResumePath()
  if (!filepath || !existsSync(filepath)) {
    return NextResponse.json({ error: "Resume not available" }, { status: 404 })
  }
  const bytes = await readFile(filepath)
  return pdfResponse(bytes)
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers)

  // Best-effort per-IP rate limit; never blocks the fallback path below.
  if (ip && isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many download requests, try again later" }, { status: 429 })
  }

  try {
    const filepath = await currentResumePath()
    if (!filepath || !existsSync(filepath)) {
      throw new Error("base resume PDF not found")
    }

    const baseBytes = await readFile(filepath)
    const exportId = randomUUID()
    const exportedAt = new Date().toISOString()
    const trackedUrl = buildTrackedUrl({ medium: "resume", campaign: exportId })

    const stamped = await stampAndRewrite(
      baseBytes,
      { export_id: exportId, exported_at: exportedAt, source: "site" },
      trackedUrl,
      buildResumeBranding()
    )

    const sessionId = request.cookies.get(SESSION_COOKIE)?.value ?? null
    const signals = sessionId ? getClientSignals(sessionId) : null
    const isReturnVisit = request.cookies.has(RETURN_COOKIE)

    insertUtmCode({
      id: exportId,
      utm_medium: "resume",
      utm_campaign: exportId,
      purpose: "resume-site-visitor",
      source: "site",
      file_format: "pdf",
      visitor_ip: ip,
      visitor_user_agent: request.headers.get("user-agent"),
      visitor_referrer: request.headers.get("referer"),
      visitor_accept_language: request.headers.get("accept-language"),
      visitor_js_timezone: signals?.js_timezone ?? null,
      visitor_js_language: signals?.js_language ?? null,
      visitor_is_return_visit: isReturnVisit,
    })

    // Site's own audit trail, separate from the DB row.
    try {
      const outDir = join(process.cwd(), "generated-resumes")
      await mkdir(outDir, { recursive: true })
      await writeFile(join(outDir, `${exportId}.pdf`), stamped)
    } catch (auditError) {
      console.error("failed to persist generated-resumes audit copy:", auditError)
    }

    return pdfResponse(stamped)
  } catch (error) {
    console.error("dynamic resume stamping failed, serving static fallback:", error)
    return serveStaticFallback()
  }
}
