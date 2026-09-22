// Simple in-memory fixed-window limiter for the visitor-download endpoint
// (spec §9, open question 3). In-memory only: fine for a single-node VPS,
// resets on restart, and does NOT coordinate across multiple instances —
// revisit with a shared store (e.g. Redis) before scaling horizontally or
// moving to serverless.
const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 10

const hits = new Map<string, { count: number; windowStart: number }>()

export function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now })
    return false
  }

  entry.count += 1
  return entry.count > MAX_REQUESTS
}
