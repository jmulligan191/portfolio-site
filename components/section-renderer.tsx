import { EducationSection } from "@/components/education-section"
import { EntriesSection } from "@/components/entries-section"
import { ProjectsSection } from "@/components/projects-section"
import { SkillsSection } from "@/components/skills-section"
import { WorkExperienceSection } from "@/components/work-experience-section"
import type { SectionConfig } from "@/content/types"

/** Renders one configured section using the component for its `type`. */
export function SectionRenderer({ section }: { section: SectionConfig }) {
  const { title, description } = section

  switch (section.type) {
    case "skills":
      return <SkillsSection title={title} description={description} data={section.data} />
    case "projects":
      return <ProjectsSection title={title} description={description} data={section.data} />
    case "education":
      return <EducationSection title={title} description={description} data={section.data} />
    case "experience":
      return <WorkExperienceSection title={title} description={description} data={section.data} />
    case "entries":
      return <EntriesSection title={title} description={description} data={section.data} />
  }
}
