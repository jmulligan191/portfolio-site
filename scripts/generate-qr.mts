#!/usr/bin/env node
// Local CLI tool: mints a UTM code and generates its QR code as a PNG.
// Two supported targets (spec §9, open question 2 — resolved: support both):
//   home    -> homepage, funnels the scan through the normal site_visits flow
//   resume  -> /resume/download, deep-links straight to a fresh stamped PDF
//
// Usage:
//   node scripts/generate-qr.mts --target resume --campaign business-card-2026
//   node scripts/generate-qr.mts --target home --campaign conference-badge-2026 --out qr-codes/badge.png
//
// Every future redirect channel (email signature, social bio link, ...)
// should go through the same buildTrackedUrl() + insertUtmCode() path this
// script uses — see lib/tracking/utm.ts.

import { mkdir } from "fs/promises"
import { dirname, join } from "path"
import { randomUUID } from "crypto"
import QRCode from "qrcode"
import { buildTrackedUrl } from "../lib/tracking/utm.ts"
import { insertUtmCode } from "../lib/tracking/repo.ts"

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue
    const key = arg.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith("--")) {
      args[key] = next
      i++
    } else {
      args[key] = "true"
    }
  }
  return args
}

const TARGET_PATHS: Record<string, string> = {
  home: "/",
  resume: "/resume/download",
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const target = args.target ?? "home"
  const path = TARGET_PATHS[target]
  if (!path) {
    console.error(`Unknown --target "${target}". Expected one of: ${Object.keys(TARGET_PATHS).join(", ")}`)
    process.exit(1)
  }

  const medium = args.medium ?? "qr"
  const campaign = args.campaign ?? `qr-${target}-${new Date().toISOString().slice(0, 10)}`
  const label = args.label ?? null
  const outPath = args.out ?? join("qr-codes", `${campaign}.png`)

  const trackedUrl = buildTrackedUrl({ medium, campaign, path })

  insertUtmCode({
    id: randomUUID(),
    utm_medium: medium,
    utm_campaign: campaign,
    purpose: "qr",
    label,
    source: null,
  })

  await mkdir(dirname(outPath), { recursive: true })
  await QRCode.toFile(outPath, trackedUrl, { width: 1024, margin: 2 })

  console.log("Tracked URL:", trackedUrl)
  console.log("QR code saved to:", outPath)
}

main().catch((error) => {
  console.error("Failed to generate QR code:", error)
  process.exit(1)
})
