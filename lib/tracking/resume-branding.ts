import { personalInfo } from "@/content/data"
import { skills } from "@/content/config"
import type { BrandingFields } from "./pdf-stamp"

// Standard PDF metadata built from the same content/config.ts values the
// site itself renders, so it stays in sync without a second place to edit.
export function buildResumeBranding(): BrandingFields {
  const { name, title, school, major, yearOrdinal } = personalInfo
  const keywordList = Array.from(
    new Set([...skills.flatMap((category) => category.items), major, school, "Resume", "Software Engineering"].filter(Boolean))
  )

  const subject = `Resume for ${name}`

  return {
    author: name,
    copyright: `© ${new Date().getFullYear()} ${name}. All rights reserved.`,
    creator: "JM Resume Pipeline {version} via LaTeX (pdfTeX)",
    title: `${name} - Resume`,
    subject,
    description: `${subject}: ${yearOrdinal} ${title} at ${school}.`,
    keywords: keywordList.join(", "),
    language: "en-US",
  }
}
