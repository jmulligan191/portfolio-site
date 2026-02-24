import { ExternalLink, Github, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { projects } from "@/lib/data"

export function ProjectsSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h2>
          <p className="mt-2 text-muted-foreground">
            A selection of things I{"'"}ve built and contributed to.
          </p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Card
            key={project.title}
            className="group relative transition-colors hover:border-primary/30"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {project.liveUrl ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      <CardTitle className="text-base">{project.title}</CardTitle>
                    </a>
                  ) : (
                    <CardTitle className="text-base">{project.title}</CardTitle>
                  )}
                  {project.featured && (
                    <Star className="size-3.5 fill-primary text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <Github className="size-4" />
                    </a>
                  </Button>
                  {project.liveUrl && (
                    <Button asChild variant="ghost" size="icon-sm">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${project.title} live`}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="mb-2">
                <Badge variant="secondary" className="text-xs">
                  {project.type} Project
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {project.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
