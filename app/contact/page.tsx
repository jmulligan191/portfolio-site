import type { Metadata } from "next"
import { Mail, Linkedin, Github, MapPin, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { contactMethods, personalInfo } from "@/lib/data"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with me. Find my email, LinkedIn, GitHub, and more.",
}

export default function ContactPage() {
  const contactIcons = {
    email: Mail,
    linkedin: Linkedin,
    github: Github,
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Contact Me
        </h1>
        <p className="mt-2 max-w-lg text-pretty text-muted-foreground">
          I{"'"}m always open to discussing new opportunities, interesting projects,
          or just connecting with fellow developers.
        </p>
      </div>

      <Separator className="my-8" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact methods */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {contactMethods.map((method) => (
            <Card
              key={method.label}
              className="group transition-colors hover:border-primary/30"
            >
              <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                  {(() => {
                    const Icon = contactIcons[method.id]
                    return <Icon className="size-5 text-primary" />
                  })()}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm font-semibold text-foreground">
                    {method.label}
                  </p>
                  <p className="text-sm text-foreground">{method.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {method.description}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a
                    href={method.href}
                    target={method.id !== "email" ? "_blank" : undefined}
                    rel={
                      method.id !== "email"
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {method.id === "email" ? "Send" : "Visit"}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info sidebar */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Me</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {personalInfo.school}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {personalInfo.year}, Software Engineering
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {personalInfo.location}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Open to remote & relocation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm font-medium text-foreground">
                Looking for:
              </p>
              <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Co-Op opportunities for Summer and/or Fall 2026
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
