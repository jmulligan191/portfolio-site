import { withSentryConfig } from "@sentry/nextjs"
import { execSync } from "child_process"

function getGitInfo() {
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim()
    const date = execSync("git log -1 --format=%cI").toString().trim()
    return { hash, date }
  } catch {
    return { hash: "unknown", date: new Date().toISOString() }
  }
}

const { hash, date } = getGitInfo()

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GIT_COMMIT: hash,
    NEXT_PUBLIC_DEPLOY_DATE: date,
  },
}

export default withSentryConfig(nextConfig, { silent: true })
