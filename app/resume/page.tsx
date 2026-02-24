import type { Metadata } from "next"
import { ResumeClient } from "@/components/resume-client"
import { prisma } from "@/lib/prisma"

export const metadata: Metadata = {
  title: "Resume",
  description:
    "View and download John Mulligan's current resume with education, skills, and experience.",
}

export const dynamic = "force-dynamic"

export default async function ResumePage() {
  const resumes = await prisma.resumeVersion.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  // Convert dates to strings for client component
  const serializedResumes = resumes.map((resume) => ({
    ...resume,
    date: resume.date.toISOString(),
    createdAt: resume.createdAt.toISOString(),
    updatedAt: resume.updatedAt.toISOString(),
  }))

  return <ResumeClient resumes={serializedResumes} />
}
