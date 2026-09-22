import {
  bio,
  classYear,
  education,
  sections,
  coopTerms,
  emailAcademic,
  emailPersonal,
  firstName,
  fullName as fullNameInput,
  githubPersonalUsername,
  githubAcademicUsername,
  lastName,
  linkedinUsername,
  location,
  locationCountry,
  middleName as middleNameInput,
  prefix,
  suffix,
  title as titleInput,
} from "./config"
import type { ContactMethod } from "./types"

// GENERATED / FORMATTED VALUES — edit ./config.ts instead of this section.

// Current school info is taken from the first education entry
const currentEducation = education[0]
const school = currentEducation.institution
const major = currentEducation.major ?? ""
const expectedGraduation = currentEducation.graduationDate

const yearWords = ["First", "Second", "Third", "Fourth", "Fifth"]
const yearOrdinals = ["1st", "2nd", "3rd", "4th", "5th"]
const yearWord = yearWords[classYear - 1] // "Second"
const yearOrdinal = yearOrdinals[classYear - 1] // "2nd"

// "Spring 2027, Summer 2027, and/or Fall 2027"
const coopTermsText =
  coopTerms.length > 1
    ? `${coopTerms.slice(0, -1).join(", ")}, and/or ${coopTerms[coopTerms.length - 1]}`
    : coopTerms[0] ?? ""

// add a period to short initials that don't already have one
const middleName =
  middleNameInput && middleNameInput.length <= 3 && !middleNameInput.endsWith(".")
    ? `${middleNameInput}.`
    : middleNameInput

const fullName =
  fullNameInput ||
  [prefix, firstName, middleName, lastName].filter(Boolean).join(" ") +
    (suffix ? `, ${suffix}` : "")

// GitHub accounts that are set; labels only mention the type when there is more than one
const githubEntries = [
  { type: "Personal", username: githubPersonalUsername },
  { type: "Academic", username: githubAcademicUsername },
].filter((g) => g.username)
export const githubAccounts = githubEntries.map((g) => ({
  label: githubEntries.length > 1 ? `GitHub (${g.type})` : "GitHub",
  shortLabel: githubEntries.length > 1 ? `${g.type} GitHub` : "GitHub",
  username: g.username,
  url: `https://github.com/${g.username}`,
}))

const title = titleInput || `${major} Student`

const formattedBio = bio
  .replaceAll("{major}", major)
  .replaceAll("{year}", `${yearOrdinal} Year`)
  .replaceAll("{coopTerms}", coopTermsText)
  .replace(/\s+/g, " ")
  .trim()

export const personalInfo = {
  name: fullName,
  fullName,
  firstName,
  lastName,

  title,
  school,
  major,
  classYear,
  year: `${yearWord} Year`,
  yearOrdinal: `${yearOrdinal} Year`,
  expectedGraduation,
  coopTerms,
  coopTermsText,

  location,
  locationCountry,
  bio: formattedBio,

  emailAcademic,
  emailPersonal,

  linkedinUsername,
  linkedin: `https://linkedin.com/in/${linkedinUsername}`,
  githubAccounts,
}

export const contactMethods: ContactMethod[] = [
    {
      id: "email",
      label: "Email",
      value: personalInfo.emailAcademic,
      href: `mailto:${personalInfo.emailAcademic}`,
      //description: "Best way to reach me for opportunities.",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: personalInfo.linkedinUsername,
      href: personalInfo.linkedin,
      //description: "Connect with me professionally.",
    },
    ...githubAccounts.map((g) => ({
      id: "github" as const,
      label: g.label,
      value: g.username,
      href: g.url,
    })),
  ]

export const navLinks = [
    { label: "Home", href: "/" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/contact" },
  ]

// Re-exports so components can import everything from "@/content/data"
export { projects, skills, education, workExperience, sections } from "./config"

/** Sections to display: enabled and containing at least one entry, in configured order. */
export const visibleSections = sections.filter(
  (section) => section.enabled !== false && section.data.length > 0
)
export type * from "./types"
