import { GraduationCap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Education } from "@/content/types"
import { CustomFields } from "@/components/custom-fields"
import type { SectionProps } from "@/components/section-props"

const formatCourseLabel = (course: {
  name: string
  code?: string
  termLabel?: string
}) => {
  const base = course.code ? `${course.code} - ${course.name}` : course.name
  const term = course.termLabel

  return term ? `${base} (${term})` : base
}

const formatTermSystem = (termSystem?: "Semester" | "Quarter") => {
  if (!termSystem) return null

  return `${termSystem}${termSystem.endsWith("s") ? "" : "s"}`
}

export function EducationSection({ title, description, data: education }: SectionProps<Education>) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="mt-8 space-y-4">
        {education.map((edu, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="mt-1 self-start rounded-lg bg-primary/10 p-2">
                    <GraduationCap className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {edu.degree}
                      {edu.major && ` - ${edu.major}`}
                    </CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {edu.institution} • {edu.location}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {edu.startDate ? `${edu.startDate} – ${edu.graduationDate}` : edu.graduationDate}
                    </p>
                    {/* {edu.termSystem && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Term system: {formatTermSystem(edu.termSystem)}
                      </p>
                    )} */}
                    {edu.details && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {edu.details}
                      </p>
                    )}
                    <CustomFields fields={edu.customFields} />
                  </div>
                </div>
              </div>
            </CardHeader>
            {edu.relevantCourses && edu.relevantCourses.length > 0 && (
              <CardContent>
                <p className="mb-2 text-sm font-medium">Relevant Courses:</p>
                <div className="flex flex-wrap gap-1.5">
                  {edu.relevantCourses.map((course) => (
                    <Badge
                      key={`${course.code ?? "course"}-${course.name}-${
                        course.termLabel ?? "term"
                      }`}
                      variant="outline"
                      className="text-xs font-normal"
                    >
                      {formatCourseLabel(course)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </section>
  )
}
