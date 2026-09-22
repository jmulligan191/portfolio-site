// Generates a new resume-export API key pair: the plaintext key (put this in
// the resume repo's local .env as RESUME_EXPORT_API_KEY) and its SHA-256
// hash (put this in the site's .env as RESUME_EXPORT_API_KEY_HASH). The
// plaintext key is never stored on the site.
import { randomBytes, createHash } from "crypto"

const key = randomBytes(32).toString("base64url")
const hash = createHash("sha256").update(key).digest("hex")

console.log("Plaintext key (resume repo .env, RESUME_EXPORT_API_KEY):")
console.log(key)
console.log()
console.log("SHA-256 hash (site .env, RESUME_EXPORT_API_KEY_HASH):")
console.log(hash)
