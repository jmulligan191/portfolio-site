import { randomUUID } from "crypto"
import { getDb } from "./db.ts"

export type UtmPurpose =
  | "resume-job-tailored"
  | "resume-site-visitor"
  | "resume-default"
  | "qr"
  | "other"

export type UtmSource = "local" | "site" | "site-default"

export interface InsertUtmCodeInput {
  id: string
  utm_medium: string
  utm_campaign: string
  utm_term?: string | null
  utm_content?: string | null
  purpose: UtmPurpose
  label?: string | null
  resume_version?: string | null
  git_commit?: string | null
  company?: string | null
  position?: string | null
  source?: UtmSource | null
  file_format?: string | null
  local_file_path?: string | null
  visitor_ip?: string | null
  visitor_user_agent?: string | null
  visitor_referrer?: string | null
  visitor_accept_language?: string | null
  visitor_js_timezone?: string | null
  visitor_js_language?: string | null
  visitor_is_return_visit?: boolean | null
  metadata?: Record<string, unknown> | null
  synced_from_local?: boolean
}

export function insertUtmCode(input: InsertUtmCodeInput) {
  const db = getDb()
  db.prepare(
    `INSERT INTO utm_codes (
      id, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      purpose, label, resume_version, git_commit, company, position, source,
      file_format, local_file_path,
      visitor_ip, visitor_user_agent, visitor_referrer, visitor_accept_language,
      visitor_js_timezone, visitor_js_language, visitor_is_return_visit,
      metadata_json, synced_from_local, created_at
    ) VALUES (
      @id, 'jmulligan191', @utm_medium, @utm_campaign, @utm_term, @utm_content,
      @purpose, @label, @resume_version, @git_commit, @company, @position, @source,
      @file_format, @local_file_path,
      @visitor_ip, @visitor_user_agent, @visitor_referrer, @visitor_accept_language,
      @visitor_js_timezone, @visitor_js_language, @visitor_is_return_visit,
      @metadata_json, @synced_from_local, @created_at
    )
    ON CONFLICT(id) DO NOTHING`
  ).run({
    id: input.id,
    utm_medium: input.utm_medium,
    utm_campaign: input.utm_campaign,
    utm_term: input.utm_term ?? null,
    utm_content: input.utm_content ?? null,
    purpose: input.purpose,
    label: input.label ?? null,
    resume_version: input.resume_version ?? null,
    git_commit: input.git_commit ?? null,
    company: input.company ?? null,
    position: input.position ?? null,
    source: input.source ?? null,
    file_format: input.file_format ?? null,
    local_file_path: input.local_file_path ?? null,
    visitor_ip: input.visitor_ip ?? null,
    visitor_user_agent: input.visitor_user_agent ?? null,
    visitor_referrer: input.visitor_referrer ?? null,
    visitor_accept_language: input.visitor_accept_language ?? null,
    visitor_js_timezone: input.visitor_js_timezone ?? null,
    visitor_js_language: input.visitor_js_language ?? null,
    visitor_is_return_visit: input.visitor_is_return_visit ? 1 : 0,
    metadata_json: input.metadata ? JSON.stringify(input.metadata) : null,
    synced_from_local: input.synced_from_local ? 1 : 0,
    created_at: new Date().toISOString(),
  })
}

export interface UtmCodeRow {
  id: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string | null
  utm_content: string | null
  purpose: UtmPurpose
  label: string | null
  resume_version: string | null
  git_commit: string | null
  company: string | null
  position: string | null
  source: UtmSource | null
  file_format: string | null
  local_file_path: string | null
  visitor_ip: string | null
  visitor_user_agent: string | null
  visitor_referrer: string | null
  visitor_accept_language: string | null
  visitor_js_timezone: string | null
  visitor_js_language: string | null
  visitor_is_return_visit: number
  metadata_json: string | null
  synced_from_local: number
  created_at: string
}

export function getUtmCodeById(id: string): UtmCodeRow | null {
  const db = getDb()
  const row = db.prepare(`SELECT * FROM utm_codes WHERE id = ?`).get(id) as UtmCodeRow | undefined
  return row ?? null
}

export function listUtmCodes(): UtmCodeRow[] {
  const db = getDb()
  return db.prepare(`SELECT * FROM utm_codes ORDER BY created_at DESC`).all() as UtmCodeRow[]
}

export interface LogSiteVisitInput {
  landingPath: string
  fullUrl: string
  rawQueryParams: Record<string, string>
  ip?: string | null
  userAgent?: string | null
  referrerHeader?: string | null
  acceptLanguage?: string | null
  isReturnVisit: boolean
}

export function logSiteVisit(input: LogSiteVisitInput) {
  const db = getDb()

  const utmSource = input.rawQueryParams.utm_source
  const utmMedium = input.rawQueryParams.utm_medium
  const utmCampaign = input.rawQueryParams.utm_campaign

  let matchedId: string | null = null
  if (utmSource && utmMedium && utmCampaign) {
    const match = db
      .prepare(
        `SELECT id FROM utm_codes WHERE utm_source = ? AND utm_medium = ? AND utm_campaign = ?`
      )
      .get(utmSource, utmMedium, utmCampaign) as { id: string } | undefined
    matchedId = match?.id ?? null
  }

  db.prepare(
    `INSERT INTO site_visits (
      id, occurred_at, landing_path, full_url, raw_query_params,
      ip, user_agent, referrer_header, accept_language,
      is_return_visit, matched_utm_code_id, is_recognized
    ) VALUES (
      @id, @occurred_at, @landing_path, @full_url, @raw_query_params,
      @ip, @user_agent, @referrer_header, @accept_language,
      @is_return_visit, @matched_utm_code_id, @is_recognized
    )`
  ).run({
    id: randomUUID(),
    occurred_at: new Date().toISOString(),
    landing_path: input.landingPath,
    full_url: input.fullUrl,
    raw_query_params: JSON.stringify(input.rawQueryParams),
    ip: input.ip ?? null,
    user_agent: input.userAgent ?? null,
    referrer_header: input.referrerHeader ?? null,
    accept_language: input.acceptLanguage ?? null,
    is_return_visit: input.isReturnVisit ? 1 : 0,
    matched_utm_code_id: matchedId,
    is_recognized: matchedId ? 1 : 0,
  })
}

export function upsertClientSignals(sessionId: string, timezone: string | null, language: string | null) {
  const db = getDb()
  db.prepare(
    `INSERT INTO client_signals (session_id, js_timezone, js_language, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(session_id) DO UPDATE SET
       js_timezone = excluded.js_timezone,
       js_language = excluded.js_language,
       updated_at = excluded.updated_at`
  ).run(sessionId, timezone, language, new Date().toISOString())
}

export function getClientSignals(sessionId: string): { js_timezone: string | null; js_language: string | null } | null {
  const db = getDb()
  const row = db
    .prepare(`SELECT js_timezone, js_language FROM client_signals WHERE session_id = ?`)
    .get(sessionId) as { js_timezone: string | null; js_language: string | null } | undefined
  return row ?? null
}
