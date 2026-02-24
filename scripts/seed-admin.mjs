import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import prompt from "prompt-sync"

const promptSync = prompt({ sigint: true })
const prisma = new PrismaClient({
  datasources: {
    db: { url: "file:./dev.db" },
  },
})

const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost"
const adminEmail = `admin@${domain}`

async function main() {
  console.log("\n🔐 Setting up admin user\n")
  console.log(`Domain: ${domain}`)
  console.log(`Admin email: ${adminEmail}\n`)

  // Prompt for admin name
  let adminName = promptSync("Enter admin name: ")
  while (!adminName || adminName.trim() === "") {
    console.log("❌ Name cannot be empty")
    adminName = promptSync("Enter admin name: ")
  }

  // Prompt for password
  let adminPassword = promptSync.hide("Enter admin password (will be hidden): ")
  while (!adminPassword || adminPassword.length < 6) {
    console.log("❌ Password must be at least 6 characters")
    adminPassword = promptSync.hide("Enter admin password (will be hidden): ")
  }

  // Confirm password
  const confirmPassword = promptSync.hide("Confirm admin password: ")
  if (adminPassword !== confirmPassword) {
    console.log("❌ Passwords do not match")
    process.exit(1)
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName.trim(),
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log(`\n✅ Admin user created: ${admin.email}\n`)
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
