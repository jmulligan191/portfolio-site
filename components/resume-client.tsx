"use client"

import { useState } from "react"
import { Download, FileText, ChevronDown, ChevronUp, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { personalInfo, skills } from "@/lib/data"
import { format } from "date-fns"

interface Resume {
  id: string
  version: string
  label: string
  date: string
  filename: string
  changelog: string
  isCurrent: boolean
}

interface ResumeClientProps {
  resumes: Resume[]
}

export function ResumeClient({ resumes }: ResumeClientProps) {
  const [showPreviousVersions, setShowPreviousVersions] = useState(false)
  const currentResume = resumes.find((v) => v.isCurrent) || resumes[0]
  const previousVersions = resumes.filter((v) => !v.isCurrent)

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Resume
          </h1>
        </div>
        <Button asChild size="lg">
          <a href={currentResume.filename} download="Resume - John Mulligan.pdf">
            <Download className="size-4" />
            Download Resume (PDF)
          </a>
        </Button>
      </div>

      <Separator className="my-8" />

      {/* Resume summary / at-a-glance */}
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>{personalInfo.name}</CardTitle>
                <CardDescription>
                  {personalInfo.title} - {personalInfo.school}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Education */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                Education
              </h3>
              <div className="mt-3 flex flex-col gap-1">
                <p className="font-medium text-foreground">
                  B.S. Software Engineering
                </p>
                <p className="text-sm text-muted-foreground">
                  {personalInfo.school} - {personalInfo.year} (Expected 2029)
                </p>
              </div>
            </div>

            <Separator />

            {/* Skills from config */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                Technical Skills
              </h3>
              <div className="mt-3 flex flex-col gap-4">
                {skills.map((group) => (
                  <div key={group.category} className="flex flex-col gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {group.category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-muted-foreground">
              For the full details including work experience and project descriptions,
              please download the PDF above.
            </p>
          </CardContent>
        </Card>

        {/* Previous versions button and section */}
        {previousVersions.length > 0 && (
          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviousVersions(!showPreviousVersions)}
              className="self-center"
            >
              <History className="size-4" />
              {showPreviousVersions ? "Hide" : "View"} Previous Versions
              {showPreviousVersions ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </Button>

            {showPreviousVersions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Previous Versions</CardTitle>
                  <CardDescription>
                    Older versions of my resume, labeled by last update date.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {previousVersions.map((version) => (
                    <div
                      key={version.version}
                      className="rounded-lg border p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">
                              {format(new Date(version.date), "MMMM yyyy")}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              Version {version.version}
                            </Badge>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <a
                            href={version.filename}
                            download={`Resume - John Mulligan - ${format(new Date(version.date), "MMMM yyyy")}.pdf`}
                            aria-label={`Download resume from ${format(new Date(version.date), "MMMM yyyy")}`}
                          >
                            <Download className="size-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
