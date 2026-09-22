// Talks to the GitHub Contents API for the resume repo (a private repo —
// https://github.com/Outlandish0191/resume — the single source of truth for
// the compiled resume PDF). Deliberately uses plain fetch() against the
// REST API rather than shelling out to `git clone`, so this works anywhere
// Node's fetch works (including a future serverless deploy) without a git
// binary or a checked-out working copy on the server.

export interface RemotePdfEntry {
  /** Filename as it exists in the repo root, e.g. "Resume-JohnMulligan.pdf". */
  name: string
  /** Git blob SHA — changes whenever the file's content changes. Used to detect updates. */
  sha: string
}

function repoSlug(): string {
  return process.env.RESUME_SOURCE_REPO || "Outlandish0191/resume"
}

function authHeaders(): Record<string, string> {
  const token = process.env.RESUME_SOURCE_GITHUB_TOKEN
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * Lists the repo root and returns the first *.pdf entry found. Throws if
 * none exists, the repo/token is misconfigured, or the request fails.
 */
export async function findRootPdfEntry(): Promise<RemotePdfEntry> {
  const res = await fetch(`https://api.github.com/repos/${repoSlug()}/contents/`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...authHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(`GitHub contents API returned ${res.status} for ${repoSlug()}: ${await res.text()}`)
  }

  const entries = (await res.json()) as Array<{ name: string; sha: string; type: string }>
  const pdf = entries.find((entry) => entry.type === "file" && entry.name.toLowerCase().endsWith(".pdf"))
  if (!pdf) {
    throw new Error(`No .pdf file found in the root of ${repoSlug()}`)
  }

  return { name: pdf.name, sha: pdf.sha }
}

/** Downloads the raw bytes of a file at the repo root via the Contents API. */
export async function downloadRootFile(filename: string): Promise<Buffer> {
  const res = await fetch(`https://api.github.com/repos/${repoSlug()}/contents/${encodeURIComponent(filename)}`, {
    headers: {
      Accept: "application/vnd.github.raw+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...authHeaders(),
    },
  })

  if (!res.ok) {
    throw new Error(`GitHub contents API returned ${res.status} downloading ${filename}: ${await res.text()}`)
  }

  return Buffer.from(await res.arrayBuffer())
}
