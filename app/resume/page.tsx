import type { Metadata } from "next"
import { ResumeClient } from "@/components/resume-client"
import { resumes } from "@/content/config"

export const metadata: Metadata = {
  title: "Resume",
  description:
    "View and download John Mulligan's current resume with education, skills, and experience.",
}

export default function ResumePage() {
  return <ResumeClient resumes={resumes} />
}
