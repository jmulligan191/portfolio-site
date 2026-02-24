import { execSync } from "child_process"

console.log("Setting DATABASE_URL and pushing schema to SQLite...")

try {
  execSync("npx prisma db push", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./dev.db",
    },
  })
  console.log("Database schema pushed successfully.")
} catch (error) {
  console.error("Failed to push database schema:", error.message)
  process.exit(1)
}
