import { ErrorButton } from "@/components/error-button"

export default function TestPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Sentry Test
        </h1>
        <p className="mt-2 text-muted-foreground">
          Click the button below to test Sentry error tracking.
        </p>
      </div>

      <div className="mt-8">
        <ErrorButton />
      </div>
    </div>
  )
}
