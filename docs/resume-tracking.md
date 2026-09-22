# Resume tracking API

Endpoints for resume downloads, UTM/QR tracking, and the resume-export
registry. Backed by a local sqlite DB (`TRACKING_DB_PATH`, default
`./data/tracking.db`) — see `lib/tracking/` for the implementation.

## Auth

Every endpoint under `/api/resume-exports` is **private** and requires a
bearer API key:

```
Authorization: Bearer <RESUME_EXPORT_API_KEY>
```

Generate a key/hash pair with:

```bash
node scripts/generate-resume-export-key.mjs
```

- The **plaintext key** goes in the resume repo's local `.env` as
  `RESUME_EXPORT_API_KEY` (used by `export/cli.py` there — never stored here).
- The **SHA-256 hash** goes in this site's `.env` as
  `RESUME_EXPORT_API_KEY_HASH`.

Requests without a valid key get `401 {"error": "Unauthorized"}`. There is
no separate auth for anything else below — those routes are meant to be hit
by anonymous site visitors.

---

## Public endpoints

### `GET /resume/download`, `GET /resume.pdf`

Stable, memorable URLs (for QR codes, business cards, direct links).
307-redirects to `GET /api/resume/download`.

### `GET /api/resume/download`

Generates a freshly-stamped copy of the current resume PDF and streams it
back with `Content-Disposition: attachment`. On every hit:

- Mints a new `export_id`, stamps it + timestamp into the PDF's hidden
  metadata, rewrites the embedded portfolio link's UTM params
- Logs a row to the `utm_codes` table (visitor IP/UA/referrer, no PII in
  the PDF itself)
- Keeps an audit copy in `generated-resumes/<export_id>.pdf`

Falls back to serving the static `public/resumes/` PDF unchanged if any of
the above fails (rate-limited, stamping error, DB write failure, etc).

Rate-limited per IP (10/hour, in-memory — see `lib/tracking/rate-limit.ts`).

### `POST /api/client-signals`

Fire-and-forget beacon (`navigator.sendBeacon`) the site calls on page load
to report `{ timezone, language }` for the current session. No response
body of interest; always returns `{ "ok": true }`.

### `GET /api/download?file=&label=`

Legacy static-file download for previous resume versions (no tracking).

---

## Private endpoints (require bearer key)

### `POST /api/resume-exports`

Called by the resume repo's local CLI after a job-tailored (Flow A) export,
so the site's DB has a record of every resume ever sent out, not just
site-triggered downloads.

```bash
curl -X POST https://jmulligan191.com/api/resume-exports \
  -H "Authorization: Bearer $RESUME_EXPORT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "export_id": "acme-swe-4f2a1c",
    "company": "Acme",
    "position": "SWE",
    "resume_version": "7.1.1",
    "git_commit": "abc1234",
    "utm_campaign": "acme-swe-4f2a1c"
  }'
```

`export_id` is the only required field. Returns `201 { "ok": true }`, or
`200`-shaped `{ "ok": true }` again on a retried/duplicate `export_id`
(idempotent — safe to retry on network failure).

### `GET /api/resume-exports`

List every export/UTM code on record (local Flow-A stamps, site Flow-B
downloads, QR codes, everything), newest first.

```bash
curl https://jmulligan191.com/api/resume-exports \
  -H "Authorization: Bearer $RESUME_EXPORT_API_KEY"
# => { "exports": [ { "id": "...", "utm_campaign": "...", ... }, ... ] }
```

Pass `?ids=true` to get back just the id list instead of full rows:

```bash
curl "https://jmulligan191.com/api/resume-exports?ids=true" \
  -H "Authorization: Bearer $RESUME_EXPORT_API_KEY"
# => { "ids": ["acme-swe-4f2a1c", "..."] }
```

### `GET /api/resume-exports/:id`

Full record for one export, including visitor PII (IP, user agent,
referrer, company/position if known).

```bash
curl https://jmulligan191.com/api/resume-exports/acme-swe-4f2a1c \
  -H "Authorization: Bearer $RESUME_EXPORT_API_KEY"
# => { "export": { "id": "acme-swe-4f2a1c", ... } }
```

`404 { "error": "Not found" }` if the id doesn't exist.

### `POST /api/resume-sync`

Manually triggers the same GitHub resume-repo check the in-process timer
runs periodically (see "Resume repo sync" below). Useful for testing, or as
the trigger for an external scheduler if the in-process timer isn't
appropriate for how the site is deployed.

```bash
curl -X POST https://jmulligan191.com/api/resume-sync \
  -H "Authorization: Bearer $RESUME_EXPORT_API_KEY"
# => { "updated": true, "reason": "updated", "filename": "resume-....pdf", "archivedFilename": "resume-....pdf" }
# or: { "updated": false, "reason": "unchanged" }
# or: { "updated": false, "reason": "no-source-configured" }
# or: { "updated": false, "reason": "error", "error": "..." }
```

---

## Resume repo sync

[github.com/Outlandish0191/resume](https://github.com/Outlandish0191/resume)
(private) is the single source of truth for the compiled resume PDF — see
`lib/resume-sync/`. On an interval (`RESUME_SYNC_INTERVAL_MINUTES`, default
30 — started once at server boot by `instrumentation.ts`), the site:

1. Lists the repo root via the GitHub Contents API and finds the `.pdf` file
2. Compares its git blob SHA to the last-synced SHA (`data/resume-sync-state.json`)
3. If changed: downloads it, renames the previously-current file into
   `public/resumes/archive/` (kept, never deleted), writes the new file as
   `public/resumes/resume-<timestamp>.pdf`, and updates the state file
4. `GET /api/resume/download` (and everything downstream of it) now serves
   the new file as the default resume

Requires `RESUME_SOURCE_GITHUB_TOKEN` (a GitHub PAT, fine-grained and
read-only, scoped to just that repo) — sync silently no-ops without one.
`RESUME_SOURCE_REPO` defaults to `Outlandish0191/resume`.

This only affects which PDF file gets served for downloads — it does not
touch `content/config.ts`'s `resumes` array (the version history / changelog
shown on the `/resume` page), which stays manually curated since a synced
PDF has no changelog text or version label an automated check could
generate.

**On a future serverless/edge deploy**, a long-lived `setInterval` in
`instrumentation.ts` won't survive between invocations — swap it for an
external scheduler (cron, GitHub Actions, etc.) calling `POST
/api/resume-sync` instead. The sync logic itself (`syncResumeFromSource()`)
doesn't change either way.

---

## QR codes

Not an HTTP endpoint — a local CLI script that mints a UTM code (via the
same DB the endpoints above read) and writes a PNG:

```bash
node scripts/generate-qr.mts --target resume --campaign business-card-2026
node scripts/generate-qr.mts --target home --campaign conference-2026
```
