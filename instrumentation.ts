// Next.js runs register() once when the server process starts. Used here to
// kick off the periodic GitHub resume-repo sync (see lib/resume-sync/) so
// the site's default resume PDF stays current without any external cron —
// appropriate for the current single-node VPS deploy. If this ever moves to
// a serverless/edge host, a long-lived setInterval won't survive between
// invocations; use the POST /api/resume-sync endpoint with an external
// scheduler (cron, GitHub Actions, etc.) instead — same underlying
// syncResumeFromSource() function either way.

declare global {
  // eslint-disable-next-line no-var
  var __resumeSyncIntervalStarted: boolean | undefined
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  if (globalThis.__resumeSyncIntervalStarted) return
  globalThis.__resumeSyncIntervalStarted = true

  const { syncResumeFromSource } = await import("@/lib/resume-sync/sync")

  const intervalMinutes = Number(process.env.RESUME_SYNC_INTERVAL_MINUTES) || 30
  const intervalMs = intervalMinutes * 60 * 1000

  const runSync = async () => {
    const result = await syncResumeFromSource()
    if (result.reason === "updated") {
      console.log(`[resume-sync] updated default resume -> ${result.filename} (archived ${result.archivedFilename ?? "nothing"})`)
    } else if (result.reason === "error") {
      console.error(`[resume-sync] failed: ${result.error}`)
    }
    // "unchanged" and "no-source-configured" are expected steady states — no log spam.
  }

  runSync()
  setInterval(runSync, intervalMs)
}
