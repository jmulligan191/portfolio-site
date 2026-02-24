"use client"

import * as Sentry from "@sentry/react"
import { Button } from "@/components/ui/button"

export function ErrorButton() {
  return (
    <Button
      onClick={() => {
        Sentry.logger.info("User triggered test error", {
          action: "test_error_button_click",
        })
        Sentry.metrics.count("test_counter", 1)
        throw new Error("This is your first error!")
      }}
      variant="destructive"
    >
      Break the world
    </Button>
  )
}
