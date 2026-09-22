import { Award, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CustomFields } from "@/components/custom-fields"
import type { SectionProps } from "@/components/section-props"
import type { Entry } from "@/content/types"

export function EntriesSection({ title, description, data: entries }: SectionProps<Entry>) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      <div className="mt-8 space-y-4">
        {entries.map((entry, index) => {
          const dates = entry.startDate
            ? `${entry.startDate} - ${entry.endDate ?? (entry.current ? "Present" : "")}`
            : entry.date
          const meta = [entry.subtitle, entry.location].filter(Boolean).join(" • ")

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex gap-3">
                  <div className="mt-1 self-start rounded-lg bg-primary/10 p-2">
                    <Award className="size-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{entry.title}</CardTitle>
                      {entry.current && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${entry.title}`}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </div>
                    {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
                    {dates && <p className="mt-0.5 text-sm text-muted-foreground">{dates}</p>}
                    <CustomFields fields={entry.customFields} />
                  </div>
                </div>
              </CardHeader>
              {((entry.description && entry.description.length > 0) ||
                (entry.tags && entry.tags.length > 0)) && (
                <CardContent className="space-y-3">
                  {entry.description && entry.description.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {entry.description.map((desc, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary">•</span>
                          <span>{desc}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
