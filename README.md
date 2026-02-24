# Portfolio Website

i built my very own cool portfolio website using next.js, prisma, and tailwindcss. it features a custom admin panel for managing my projects, skills, education, work experience, and resume.

The site is deployed at the following URL: [https://jmulligan191.com](https://jmulligan191.com)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (`npm install -g pnpm`)
- SQLite (included with Prisma)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jmulligan191/portfolio-site.git
   cd portfolio-site
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example and fill in your values
   cp .env.example .env
   ```

4. **Configure your portfolio data**
   ```bash
   # Copy the example data file
   cp lib/data.example.ts lib/data.ts
   
   # Edit with your information
   nano lib/data.ts
   ```

5. **Set up the database**
   ```bash
   # Run Prisma migrations
   pnpm exec prisma migrate dev --name init
   ```

6. **Seed the admin user**
   ```bash
   # Interactive script - prompts for admin name and password
   node scripts/seed-admin.mjs
   ```
   This will prompt you for:
   - Admin name (any display name)
   - Admin password (minimum 6 characters, hidden input)
   - Password confirmation
   
   The admin email will be `admin@<your-domain>` from `NEXT_PUBLIC_DOMAIN`

### Development

```bash
# Start development server (runs on port 1910 by default)
pnpm dev

# Open http://localhost:1910
# Admin panel at: http://localhost:1910/admin
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `1910` | Port to run the server on |
| `NEXT_PUBLIC_DOMAIN` | `johnmulligan.dev` | Your domain name (used for admin email, Sentry) |
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `AUTH_SECRET` | (required) | NextAuth secret for JWT signing |
| `NEXT_PUBLIC_ENABLE_CF_ANALYTICS` | `false` | Enable Cloudflare Analytics |
| `NEXT_PUBLIC_CF_BEACON_URL` | Cloudflare URL | Analytics beacon script URL |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | (optional) | Cloudflare token |
| `NEXT_PUBLIC_SENTRY_DSN` | (optional) | Sentry DSN for error tracking |

## Portfolio Content (lib/data.ts)

The `lib/data.ts` file contains all your portfolio content:

```typescript
export const personalInfo = {
  name: "Your Name",
  title: "Your Title",
  school: "Your University",
  // ... more personal info
}

export const projects: Project[] = [
  {
    title: "Project Name",
    description: "What it does...",
    tags: ["React", "Node.js"],
    githubUrl: "https://github.com/...",
    liveUrl: "https://...",
    type: "Personal" | "Academic"
  },
  // ... more projects
]

export const skills: Skill[] = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "TypeScript"]
  },
  // ... more skills
]

export const education: Education[] = [
  {
    degree: "Bachelor of Science",
    major: "Computer Science",
    institution: "Your University",
    graduationDate: "May 2025",
    relevantCourses: [...]
  },
  // ... more education
]

export const workExperience: WorkExperience[] = [
  {
    title: "Software Engineer",
    company: "Company Name",
    startDate: "June 2024",
    endDate: "Present",
    description: [...]
  },
  // ... more work experience
]
```

## Admin Panel

Access at `/admin` using the credentials you set up during the seeding process:
- **Email**: `admin@<your-domain>` (from `NEXT_PUBLIC_DOMAIN`)
- **Password**: The password you entered when running `node scripts/seed-admin.mjs`

The admin panel allows you to:
- Upload and manage resume PDF versions
- Auto-version based on upload date
- Download your resumes with user-friendly filenames
- View all portfolio content from the database

**⚠️ Security**: Use a strong password for production deployments.

## Icons

To regenerate PNG icons from SVG:

```bash
# Install sharp (one-time)
pnpm add -D sharp

# Generate PNGs
pnpm run generate-icons
```

This creates:
- `icon-dark-32x32.png` - Favicon
- `apple-icon.png` - Apple bookmark icon
- `placeholder-logo.png` - Logo variant

## Analytics & Error Tracking

### Cloudflare Web Analytics

1. Sign up at [Cloudflare](https://www.cloudflareinsights.com/)
2. Copy your site token
3. Set in `.env`:
   ```
   NEXT_PUBLIC_ENABLE_CF_ANALYTICS="true"
   NEXT_PUBLIC_CF_ANALYTICS_TOKEN="your-token"
   ```
4. Only activates in production (`NODE_ENV=production`)

### Sentry Error Tracking

1. Sign up at [Sentry.io](https://sentry.io/)
2. Create a Next.js project
3. Get your DSN and update `.env`:
   ```
   NEXT_PUBLIC_SENTRY_DSN="your-dsn"
   SENTRY_DSN="your-dsn"
   ```
4. Configure other Sentry variables for source maps

Test errors at `/test` page in development.

## Common Tasks

### Update Portfolio Content

1. Edit `lib/data.ts`
2. Restart dev server (`pnpm dev`)
3. Changes appear immediately

### Add a New Project

```typescript
// In lib/data.ts
export const projects: Project[] = [
  // ... existing projects
  {
    title: "My New Project",
    description: "What it does",
    tags: ["React", "TypeScript"],
    githubUrl: "https://github.com/yourname/project",
    liveUrl: "https://project.example.com",
    featured: true,
    type: "Personal"
  }
]
```

### Add a New Skill

```typescript
// In lib/data.ts
export const skills: Skill[] = [
  // ... existing skills
  {
    category: "New Category",
    items: ["Skill 1", "Skill 2", "Skill 3"]
  }
]
```

### Upload a New Resume (via Admin)

1. Go to `/admin`
2. Click "Upload Resume"
3. Select PDF file
4. Add changelog notes
5. Mark as current if needed
6. Upload

Resumes are auto-versioned and downloadable from the Resume page.

## Troubleshooting

### Admin login not working

1. Check that `NEXT_PUBLIC_DOMAIN` matches your domain in `.env`
2. Verify you're using the correct email (`admin@<your-domain>`) and password from the seeding script
3. To reset admin user:
   ```bash
   rm dev.db
   pnpm exec prisma migrate dev --name init
   node scripts/seed-admin.mjs
   ```
4. Check `dev.db` file exists in project root

### Sentry not capturing errors

1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set correctly in `.env`
2. Check `NODE_ENV=production` for production builds
3. Test with the `/test` page
4. Check browser console for errors

### Resumes folder not found

1. Ensure `public/resumes/` directory exists: `mkdir -p public/resumes`
2. Check file permissions
3. Ensure `.gitignore` doesn't block the directory

## License

[Your License Here]

## Support

For issues or questions, open an issue on [GitHub](https://github.com/jmulligan191/portfolio-site/issues).
