// Shared types for the content files (tracked; contains no personal data).

/** Extra "Label: value" line you can attach to any entry for specialized info (GPA, advisor, stack, ...). */
export interface CustomField {
  label: string
  value: string
  href?: string
}

export interface ContactMethod {
  id: "email" | "linkedin" | "github"
  label: string
  value: string
  href: string
  description?: string
}

export interface Project {
  title: string
  description: string
  tags: string[]
  githubUrl: string
  liveUrl?: string
  featured?: boolean
  type: "Personal" | "Academic"
  customFields?: CustomField[]
}

export interface Skill {
  category: string
  items: string[]
  customFields?: CustomField[]
}

export interface Course {
  name: string
  code?: string
  termLabel?: string
}

export interface Education {
  degree: string
  major?: string
  institution: string
  location: string
  startDate?: string
  graduationDate: string
  relevantCourses?: Course[]
  details?: string
  termSystem?: "Semester" | "Quarter"
  customFields?: CustomField[]
}

export interface WorkExperience {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current?: boolean
  description?: string[]
  customFields?: CustomField[]
}

export interface Resume {
  id: string
  version: string
  label: string
  date: string // ISO 8601
  filename: string
  changelog: string
  isCurrent: boolean
}

/** Generic entry used by optional sections: certifications, awards, publications, volunteering, ... */
export interface Entry {
  title: string
  subtitle?: string // issuer, organization, publisher, ...
  location?: string
  startDate?: string
  endDate?: string
  date?: string // single date (e.g. issued May 2025), used when there is no range
  current?: boolean
  url?: string
  description?: string[]
  tags?: string[]
  customFields?: CustomField[]
}

// ---- Section layout ----
interface SectionBase {
  /** Heading shown on the site. */
  title: string
  /** Optional line under the heading. */
  description?: string
  /** Set false to hide the section. Empty sections are hidden automatically. Default: true. */
  enabled?: boolean
  /** Also show a compact version on the /resume page. Default: false. */
  resume?: boolean
  /** Heading override on the /resume page. Defaults to `title`. */
  resumeTitle?: string
}

export type SectionConfig =
  | (SectionBase & { type: "skills"; data: Skill[] })
  | (SectionBase & { type: "projects"; data: Project[] })
  | (SectionBase & { type: "education"; data: Education[] })
  | (SectionBase & { type: "experience"; data: WorkExperience[] })
  | (SectionBase & { type: "entries"; data: Entry[] })
