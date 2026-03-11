import { personalInfo } from "@/lib/data"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const gitCommit = process.env.NEXT_PUBLIC_GIT_COMMIT
  const deployDate = process.env.NEXT_PUBLIC_DEPLOY_DATE
    ? new Date(process.env.NEXT_PUBLIC_DEPLOY_DATE).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center text-sm text-muted-foreground md:flex-row md:justify-between md:text-left">
        <p>
          Copyright {currentYear} - {personalInfo.name}. All rights reserved.
        </p>
        <div className="flex flex-col items-center gap-3 md:items-end">
          <div className="flex items-center gap-4">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              LinkedIn
            </a>
            <a
              href={`mailto:${personalInfo.emailAcademic}`}
              className="transition-colors hover:text-foreground"
            >
              Email
            </a>
          </div>
          {(deployDate || gitCommit) && (
            <p className="text-xs text-muted-foreground/60">
              {deployDate && <>Deployed {deployDate}</>}
              {deployDate && gitCommit && <> &middot; </>}
              {gitCommit && <>v{gitCommit}</>}
            </p>
          )}
        </div>
      </div>
    </footer>
  )
}
