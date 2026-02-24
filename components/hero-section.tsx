import Link from "next/link"
import { ArrowRight, FileText, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { personalInfo } from "@/lib/data"

export function HeroSection() {
  return (
    <section className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 pb-16 pt-20 md:pt-28">
      <Badge variant="secondary" className="text-xs font-medium tracking-wide">
        {personalInfo.year} @ {personalInfo.school}
      </Badge>
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Hey, I{"'"}m{" "}
          <span className="text-primary">{personalInfo.firstName}</span>
          <span className="text-primary">.</span>
        </h1>
        <p className="text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
          {personalInfo.bio}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button asChild size="lg">
          <Link href="/resume">
            <FileText className="size-4" />
            View Resume
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a
            href={personalInfo.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-4" />
            GitHub
          </a>
        </Button>
        <Button asChild variant="ghost" size="lg">
          <Link href="/contact">
            Contact Me
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
