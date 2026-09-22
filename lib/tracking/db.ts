import Database from "better-sqlite3"
import { existsSync, mkdirSync } from "fs"
import { dirname, join } from "path"

// SQLite is a deliberate choice for the current VPS deployment (see
// docs/resume-tracking.md). If the site ever moves to a serverless/edge
// host, this module is the only thing that needs to be swapped for a
// hosted DB client — nothing outside lib/tracking/ talks to sqlite directly.
const DB_PATH = process.env.TRACKING_DB_PATH || join(process.cwd(), "data", "tracking.db")

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db

  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  db = new Database(DB_PATH)
  db.pragma("journal_mode = WAL")
  migrate(db)
  return db
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS utm_codes (
      id                      TEXT PRIMARY KEY,
      utm_source              TEXT NOT NULL DEFAULT 'jmulligan191',
      utm_medium              TEXT NOT NULL,
      utm_campaign            TEXT NOT NULL UNIQUE,
      utm_term                TEXT,
      utm_content             TEXT,

      purpose                 TEXT NOT NULL,
      label                   TEXT,

      resume_version          TEXT,
      git_commit              TEXT,
      company                 TEXT,
      position                TEXT,
      source                  TEXT,
      file_format             TEXT,
      local_file_path         TEXT,

      visitor_ip               TEXT,
      visitor_user_agent        TEXT,
      visitor_referrer           TEXT,
      visitor_accept_language     TEXT,
      visitor_js_timezone          TEXT,
      visitor_js_language            TEXT,
      visitor_is_return_visit          INTEGER,

      metadata_json           TEXT,

      synced_from_local        INTEGER NOT NULL DEFAULT 0,
      created_at               TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_visits (
      id                  TEXT PRIMARY KEY,
      occurred_at          TEXT NOT NULL,
      landing_path          TEXT NOT NULL,
      full_url               TEXT NOT NULL,
      raw_query_params        TEXT,

      ip                        TEXT,
      user_agent                 TEXT,
      referrer_header              TEXT,
      accept_language               TEXT,
      js_timezone                    TEXT,
      js_language                     TEXT,
      is_return_visit                  INTEGER NOT NULL DEFAULT 0,

      matched_utm_code_id  TEXT REFERENCES utm_codes(id),
      is_recognized          INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ip_intel (
      ip              TEXT PRIMARY KEY,
      city            TEXT,
      region          TEXT,
      country         TEXT,
      latitude        REAL,
      longitude       REAL,
      isp             TEXT,
      asn              TEXT,
      organization      TEXT,
      resolved_at        TEXT NOT NULL,
      resolver_source      TEXT
    );

    -- Not part of the original schema doc: an internal, short-lived store
    -- for Tier-2 client signals (timezone/language) reported by a
    -- fire-and-forget beacon, keyed by session so the download handler can
    -- look them up. Never queried directly by anything outside this module.
    CREATE TABLE IF NOT EXISTS client_signals (
      session_id   TEXT PRIMARY KEY,
      js_timezone   TEXT,
      js_language    TEXT,
      updated_at      TEXT NOT NULL
    );
  `)
}
