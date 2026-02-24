"use client"

import * as Sentry from "@sentry/react"
import { ReactNode } from "react"

const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost"
const domainRegex = new RegExp(`^https:\\/\\/${domain.replace(/\./g, "\\.")}\\/api`)

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration(),
        //Sentry.prismaIntegration()
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", domainRegex],
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.,
    // Enable logs to be sent to Sentry
    enableLogs: true
  })
}

export function SentryProvider({ children }: { children: ReactNode }) {
  return children
}
