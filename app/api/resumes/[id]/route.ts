import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const body = await request.json()
    const { date, filename, changelog, isCurrent } = body

    // If this is marked as current, unmark all other resumes
    if (isCurrent) {
      await prisma.resumeVersion.updateMany({
        where: { 
          isCurrent: true,
          id: { not: params.id }
        },
        data: { isCurrent: false, label: "Previous" },
      })
    }

    const resume = await prisma.resumeVersion.update({
      where: { id: params.id },
      data: {
        label: isCurrent ? "Current" : "Previous",
        date: new Date(date),
        filename,
        changelog,
        isCurrent: isCurrent || false,
      },
    })

    // Recalculate version numbers for all resumes
    await recalculateVersions()

    return NextResponse.json(resume)
  } catch (error) {
    console.error("Error updating resume:", error)
    return NextResponse.json(
      { error: "Failed to update resume" },
      { status: 500 }
    )
  }
}

// DELETE resume
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params

    await prisma.resumeVersion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting resume:", error)
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    )
  }
}
