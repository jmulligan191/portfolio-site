import { readFile, writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import { dirname, join } from "path"

// Tracks which locally-downloaded copy is "current" and which upstream
// commit it came from, so repeated syncs can tell whether the source PDF
// actually changed. Lives next to the tracking sqlite DB (same gitignored
// /data/ directory).
const STATE_PATH = process.env.RESUME_SYNC_STATE_PATH || join(process.cwd(), "data", "resume-sync-state.json")

export interface ResumeSyncState {
  /** Filename (relative to public/resumes/) currently being served as the default resume. */
  currentFilename: string | null
  /** Original filename as it exists in the source repo, e.g. "Resume-JohnMulligan.pdf". */
  sourceFilename: string | null
  /** Git blob SHA of the source file as of the last successful sync. */
  sourceSha: string | null
  syncedAt: string | null
}

const EMPTY_STATE: ResumeSyncState = {
  currentFilename: null,
  sourceFilename: null,
  sourceSha: null,
  syncedAt: null,
}

export async function readSyncState(): Promise<ResumeSyncState> {
  if (!existsSync(STATE_PATH)) return { ...EMPTY_STATE }
  try {
    const raw = await readFile(STATE_PATH, "utf-8")
    return { ...EMPTY_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...EMPTY_STATE }
  }
}

export async function writeSyncState(state: ResumeSyncState): Promise<void> {
  const dir = dirname(STATE_PATH)
  if (!existsSync(dir)) await mkdir(dir, { recursive: true })
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2))
}
