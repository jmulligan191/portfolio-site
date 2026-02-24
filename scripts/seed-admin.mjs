import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient({
  datasources: {
    db: { url: "file:./dev.db" },
  },
})

const domain = process.env.NEXT_PUBLIC_DOMAIN || "localhost"
const adminEmail = `admin@${domain}`

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "John Mulligan",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    },
  })
  console.log("Admin user created:", admin.email)
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
