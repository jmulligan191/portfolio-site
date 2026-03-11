import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join, basename } from "path"
import { existsSync } from "fs"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get("file")

  if (!file) {
    return NextResponse.json({ error: "File parameter required" }, { status: 400 })
  }

  // Security: strip to basename only to prevent path traversal attacks
  const filename = basename(file)

  // Only serve PDF files from the resumes directory
  if (!filename.endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
  }

  const filepath = join(process.cwd(), "public", "resumes", filename)

  if (!existsSync(filepath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 })
  }

  try {
    const fileBuffer = await readFile(filepath)
    const label = searchParams.get("label") ?? "Resume - John Mulligan"
    const safeLabel = label.replace(/[^a-zA-Z0-9 \-_.()]/g, "")

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeLabel}.pdf"`,
        "Content-Length": String(fileBuffer.length),
      },
    })
  } catch (error) {
    console.error("Error reading file:", error)
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 })
  }
}
