// COPY THIS FILE TO content/config.ts AND FILL IN YOUR INFORMATION (excluded from git)
// It is the only file you need to edit: profile, projects, skills, education, work experience, resumes.

import type {
  Education,
  Entry,
  Project,
  Resume,
  SectionConfig,
  Skill,
  WorkExperience,
} from "./types"

// (excluded from git via .gitignore) — edit only that copy to update the site's personal details.
// data.ts imports these values and generates/format everything derived from them.

// ---- School ----
// School, major and expected graduation come from the first entry in `education` below.
// Current year in school (1-5)
export const classYear = 2

// ---- Co-Op ----
// Terms you're seeking
export const coopTerms = ["Spring 2027", "Summer 2027", "Fall 2027"]

// ---- Name ----
// Leave fullName empty ("") to build it from the parts below.
export const fullName: string = ""
// mr/ms/dr prefix, if desired
export const prefix: string = ""
export const firstName = "Your"
// Initials or full name; a period is added to short initials automatically
export const middleName: string = ""
export const lastName = "Name"
// Jr./Sr. or credentials (PhD, MD)
export const suffix: string = ""

// ---- Location & title ----
export const location = "City, State"
export const locationCountry = "USA"
// Leave empty ("") to default to "<major> Student"
export const title: string = ""

// ---- Contact ----
export const emailAcademic = "academic@university.edu"
export const emailPersonal = "personal@email.com"
export const linkedinUsername = "yourprofile"
// Set either or both; leave one empty ("") to hide it
export const githubPersonalUsername: string = "yourprofile"
export const githubAcademicUsername: string = ""

// ---- Bio ----
// Line breaks are collapsed on the site. Placeholders:
//   {year}     -> e.g. "2nd Year"
//   {major}    -> major from your first education entry
//   {coopTerms} -> e.g. "Spring 2027, Summer 2027, and/or Fall 2027"
export const bio = `{year} {major} student. A brief description of your skills and what you are looking for. Seeking Co-Op for {coopTerms}.`

// ==================== PROJECTS ====================
// Add a project by adding an object to this array
export const projects: Project[] = [
  {
    title: "Project Name",
    description: "What it does, what you built, and the impact.",
    tags: ["React", "TypeScript"],
    githubUrl: "https://github.com/yourprofile/project",
    liveUrl: "https://example.com", // optional
    featured: true,
    type: "Personal", // "Personal" | "Academic"
  },
]

// ==================== SKILLS ====================
export const skills: Skill[] = [
  { category: "Languages", items: ["Python", "JavaScript"] },
  { category: "Frameworks & Libraries", items: ["React", "Django"] },
]

// ==================== EDUCATION ====================
// The FIRST entry is your current school: its institution, major and graduationDate
// are used across the site (hero, contact, title, bio).
export const education: Education[] = [
  {
    degree: "Bachelor of Science",
    major: "Your Major",
    institution: "Your University Name",
    location: "City, State",
    startDate: "August 2025",
    graduationDate: "May 2029",
    termSystem: "Semester",
    relevantCourses: [{ name: "Data Structures", code: "CS-201", termLabel: "Spring 2026" }],
  },
  {
    degree: "High School Diploma",
    institution: "Your High School",
    location: "City, State",
    startDate: "September 2021",
    graduationDate: "June 2025",
    termSystem: "Semester",
  },
]

// ==================== WORK EXPERIENCE ====================
export const workExperience: WorkExperience[] = [
  {
    title: "Job Title",
    company: "Company",
    location: "City, State",
    startDate: "June 2024",
    endDate: "Present",
    current: true,
    description: ["What you did and the impact it had"],
  },
]

// ==================== OPTIONAL SECTIONS ====================
// Empty by default. Fill any of these in, then enable its entry in `sections` below.
// Every entry (here and above) can also carry `customFields` for specialized info:
//   customFields: [{ label: "GPA", value: "3.9" }, { label: "Advisor", value: "Dr. Lee", href: "https://..." }]

// Experience that's relevant but separate from your main work experience above
export const relevantExperience: WorkExperience[] = [
  {
    title: "Teaching Assistant",
    company: "Your University",
    location: "City, State",
    startDate: "Jan 2026",
    endDate: "May 2026",
    description: ["Held weekly office hours for 60 students"],
    customFields: [{ label: "Course", value: "CS-101" }],
  },
]

export const certifications: Entry[] = [
  {
    title: "AWS Cloud Practitioner",
    subtitle: "Amazon Web Services",
    date: "May 2025",
    url: "https://example.com/credential",
    customFields: [{ label: "Credential ID", value: "ABC123" }],
  },
]

export const awards: Entry[] = []
export const publications: Entry[] = []
export const volunteering: Entry[] = []
export const leadership: Entry[] = []
export const languages: Entry[] = []

// ==================== SECTION LAYOUT ====================
// Controls which sections appear, their ORDER (top to bottom on the home page), and their titles.
//   - Reorder by moving entries up or down.
//   - Change `title` / `description` to rename a section.
//   - Set `enabled: false` to hide one (sections with no data are hidden automatically).
//   - Set `resume: true` to also show a compact version on the /resume page (in this order).
//   - Add your own: `type: "entries"` with any title and your own `data` array
//     (types: "skills" | "projects" | "education" | "experience" | "entries").
export const sections: SectionConfig[] = [
  {
    type: "skills",
    title: "Skills & Technologies",
    description: "Tools and technologies I work with.",
    data: skills,
    resume: true,
    resumeTitle: "Technical Skills",
  },
  {
    type: "projects",
    title: "Projects",
    description: "A selection of things I've built and contributed to.",
    data: projects,
  },
  { type: "education", title: "Education", data: education, resume: true },
  { type: "experience", title: "Work Experience", data: workExperience },
  { type: "experience", title: "Relevant Experience", data: relevantExperience },
  { type: "entries", title: "Certifications", data: certifications },
  { type: "entries", title: "Awards & Honors", data: awards },
  { type: "entries", title: "Publications", data: publications },
  { type: "entries", title: "Volunteering", data: volunteering },
  { type: "entries", title: "Leadership & Activities", data: leadership },
  { type: "entries", title: "Languages", data: languages },
]

// ==================== RESUMES ====================
export const resumes: Resume[] = [
  {
    id: "1.0",
    version: "1.0",
    label: "Current",
    date: "2026-01-01T00:00:00.000Z",
    filename: "/resumes/your-resume.pdf",
    changelog: "Initial resume",
    isCurrent: true,
  },
]
