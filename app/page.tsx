import { HeroSection } from "@/components/hero-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { EducationSection } from "@/components/education-section"
import { WorkExperienceSection } from "@/components/work-experience-section"
import { Separator } from "@/components/ui/separator"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Separator className="mx-auto max-w-5xl" />
      <SkillsSection />
      <Separator className="mx-auto max-w-5xl" />
      <ProjectsSection />
      <Separator className="mx-auto max-w-5xl" />
      <EducationSection />
      <Separator className="mx-auto max-w-5xl" />
      <WorkExperienceSection />
    </>
  )
}
