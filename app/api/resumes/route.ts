import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all resumes
export async function GET() {
  try {
    const resumes = await prisma.resumeVersion.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json(resumes)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    )
  }
}

// POST create new resume
export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, filename, changelog, isCurrent } = body

    // If this is marked as current, unmark all other resumes
    if (isCurrent) {
      await prisma.resumeVersion.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false, label: "Previous" },
      })
    }

    // Get all resumes to calculate version number
    const allResumes = await prisma.resumeVersion.findMany({
      orderBy: { date: "asc" },
    })

    // Create temporary array with new resume to calculate its version
    const resumeDate = new Date(date)
    const tempResumes = [
      ...allResumes.map((r) => ({ date: r.date })),
      { date: resumeDate },
    ].sort((a, b) => a.date.getTime() - b.date.getTime())

    const version = String(tempResumes.findIndex((r) => r.date.getTime() === resumeDate.getTime()) + 1)

    const resume = await prisma.resumeVersion.create({
      data: {
        version: `${version}.0`,
        label: isCurrent ? "Current" : "Previous",
        date: resumeDate,
        filename,
        changelog,
        isCurrent: isCurrent || false,
      },
    })

    // Recalculate version numbers for all resumes
    await recalculateVersions()

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error("Error creating resume:", error)
    return NextResponse.json(
      { error: "Failed to create resume" },
      { status: 500 }
    )
  }
}

// Helper function to recalculate all version numbers based on date
async function recalculateVersions() {
  const resumes = await prisma.resumeVersion.findMany({
    orderBy: { date: "asc" },
  })

  for (let i = 0; i < resumes.length; i++) {
    await prisma.resumeVersion.update({
      where: { id: resumes[i].id },
      data: { version: `${i + 1}.0` },
    })
  }
}
