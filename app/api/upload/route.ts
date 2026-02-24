import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create resumes directory if it doesn't exist
    const resumesDir = join(process.cwd(), "public", "resumes")
    if (!existsSync(resumesDir)) {
      await mkdir(resumesDir, { recursive: true })
    }

    // Generate filename based on timestamp
    const timestamp = Date.now()
    const filename = `resume-${timestamp}.pdf`
    const filepath = join(resumesDir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({ 
      success: true, 
      filename: `/resumes/${filename}` 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
