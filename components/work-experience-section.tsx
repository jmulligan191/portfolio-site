import { Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { workExperience } from "@/lib/data"

export function WorkExperienceSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Work Experience
          </h2>
          <p className="mt-2 text-muted-foreground">
            Professional experience and positions held.
          </p>
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {workExperience.map((work, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 rounded-lg bg-primary/10 p-2">
                    <Briefcase className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{work.title}</CardTitle>
                      {work.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {work.company}
                      {work.location && ` • ${work.location}`}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {work.startDate} - {work.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            {work.description && work.description.length > 0 && (
              <CardContent>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {work.description.map((desc, descIndex) => (
                    <li key={descIndex} className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{desc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
