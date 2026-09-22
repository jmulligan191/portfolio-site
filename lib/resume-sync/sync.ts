import { readFile, writeFile, rename, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"
import { findRootPdfEntry, downloadRootFile } from "./github"
import { readSyncState, writeSyncState } from "./state"

const RESUMES_DIR = join(process.cwd(), "public", "resumes")
const ARCHIVE_DIR = join(RESUMES_DIR, "archive")

export interface SyncResult {
  updated: boolean
  reason: "unchanged" | "updated" | "no-source-configured" | "error"
  filename?: string
  archivedFilename?: string
  error?: string
}

/**
 * Checks the resume repo (github.com/Outlandish0191/resume, the single
 * source of truth for the compiled PDF) for a new version of the root
 * .pdf file. If its content changed since the last sync, downloads it,
 * archives the previously-current file (renamed into public/resumes/archive/,
 * never deleted), and starts serving the new one as the default resume.
 *
 * Never throws — failures are reported in the returned SyncResult so a
 * caller (the periodic timer, or the manual trigger endpoint) can log
 * without crashing anything. The site keeps serving whatever was current
 * before a failed sync.
 */
export async function syncResumeFromSource(): Promise<SyncResult> {
  if (!process.env.RESUME_SOURCE_GITHUB_TOKEN) {
    return { updated: false, reason: "no-source-configured" }
  }

  try {
    const entry = await findRootPdfEntry()
    const state = await readSyncState()

    if (state.sourceSha === entry.sha) {
      return { updated: false, reason: "unchanged" }
    }

    const bytes = await downloadRootFile(entry.name)

    if (!existsSync(RESUMES_DIR)) await mkdir(RESUMES_DIR, { recursive: true })
    if (!existsSync(ARCHIVE_DIR)) await mkdir(ARCHIVE_DIR, { recursive: true })

    let archivedFilename: string | undefined
    if (state.currentFilename) {
      const oldPath = join(RESUMES_DIR, state.currentFilename)
      if (existsSync(oldPath)) {
        archivedFilename = state.currentFilename
        let archivePath = join(ARCHIVE_DIR, archivedFilename)
        if (existsSync(archivePath)) {
          // Already-archived name collision (re-downloaded same filename twice) — disambiguate.
          archivedFilename = `${Date.now()}-${archivedFilename}`
          archivePath = join(ARCHIVE_DIR, archivedFilename)
        }
        await rename(oldPath, archivePath)
      }
    }

    const newFilename = `resume-${Date.now()}.pdf`
    await writeFile(join(RESUMES_DIR, newFilename), bytes)

    await writeSyncState({
      currentFilename: newFilename,
      sourceFilename: entry.name,
      sourceSha: entry.sha,
      syncedAt: new Date().toISOString(),
    })

    return { updated: true, reason: "updated", filename: newFilename, archivedFilename }
  } catch (error) {
    return { updated: false, reason: "error", error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Resolves the filename (relative to public/resumes/) currently served as
 * the default resume. Prefers whatever the last successful GitHub sync
 * downloaded; falls back to content/config.ts's `isCurrent` entry if no
 * sync has ever run (or the synced file is missing on disk).
 */
export async function resolveCurrentResumeFilename(fallback: string | null): Promise<string | null> {
  const state = await readSyncState()
  if (state.currentFilename) {
    const path = join(RESUMES_DIR, state.currentFilename)
    if (existsSync(path)) return state.currentFilename
  }
  return fallback
}
