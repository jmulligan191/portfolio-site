"use client"

import { useEffect } from "react"

// Fire-and-forget Tier-2 signal beacon (spec: resume tracking, §5). Tied to
// the session cookie automatically via normal cookie transmission — never
// awaited, never on the critical path of anything. If this never fires (JS
// disabled/blocked), the corresponding DB fields simply stay NULL.
export function ClientSignalsBeacon() {
  useEffect(() => {
    try {
      const payload = JSON.stringify({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      })

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" })
        navigator.sendBeacon("/api/client-signals", blob)
      } else {
        fetch("/api/client-signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {})
      }
    } catch {
      // Never let this affect the page.
    }
  }, [])

  return null
}
