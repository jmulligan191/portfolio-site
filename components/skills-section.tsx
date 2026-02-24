import { Badge } from "@/components/ui/badge"
import { skills } from "@/lib/data"

export function SkillsSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Skills & Technologies
      </h2>
      <p className="mt-2 text-muted-foreground">
        Tools and technologies I work with.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((group) => (
          <div key={group.category} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
              {group.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <Badge key={item} variant="secondary" className="font-normal">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
