# Portfolio Website

i built my very own cool portfolio website using next.js and tailwindcss. all content (profile, projects, skills, education, work experience, and resume history) is hardcoded in the `content/` folder, so no database is needed.

The site is deployed at the following URL: [https://jmulligan191.com](https://jmulligan191.com)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (`npm install -g pnpm`)

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
   cp content/config.example.ts content/config.ts
   ```

   `content/config.ts` (gitignored) is the only file you need to edit. It holds your profile (name, school, class year, graduation, Co-Op terms, contact/GitHub, bio), projects, skills, education, work experience, and resume history (put the PDF in `public/resumes/`, add an entry, mark it `isCurrent: true`). `data.ts` only generates and formats values.


### Development

```bash
# Start development server (runs on port 1910 by default)
pnpm dev

# Open http://localhost:1910
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Server will run on the port specified in .env (default: 1910)
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `1910` | Port to run the server on |
| `NEXT_PUBLIC_DOMAIN` | `johnmulligan.dev` | Your domain name (used for Sentry) |
| `AUTH_SECRET` | (required) | NextAuth secret for JWT signing |
| `NEXT_PUBLIC_ENABLE_CF_ANALYTICS` | `false` | Enable Cloudflare Analytics |
| `NEXT_PUBLIC_CF_BEACON_URL` | Cloudflare URL | Analytics beacon script URL |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | (optional) | Cloudflare token |
| `NEXT_PUBLIC_SENTRY_DSN` | (optional) | Sentry DSN for error tracking |

### Customizing sections

The `sections` list in `content/config.ts` controls the layout of the home page:

- **Order:** move entries up or down.
- **Titles:** edit `title` and `description`.
- **Hide/show:** set `enabled: false`. Sections with no data are hidden automatically.
- **Resume page:** set `resume: true` to show a compact version on `/resume` (`resumeTitle` overrides the heading).
- **Optional sections:** `relevantExperience`, `certifications`, `awards`, `publications`, `volunteering`, `leadership` and `languages` are ready to fill in.
- **Your own section:** add `{ type: "entries", title: "Anything", data: myArray }`. Types are `skills`, `projects`, `education`, `experience` and `entries`.
- **Custom fields:** any entry accepts `customFields: [{ label: "GPA", value: "3.9", href?: "..." }]`.

## Portfolio Content (content/)

The typed data lives in `content/config.ts`:

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

1. Edit `content/config.ts`
2. Restart dev server (`pnpm dev`)
3. Changes appear immediately

### Add a New Project

```typescript
// In content/config.ts
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
// In content/config.ts
export const skills: Skill[] = [
  // ... existing skills
  {
    category: "New Category",
    items: ["Skill 1", "Skill 2", "Skill 3"]
  }
]
```

### Publish a New Resume

1. Copy the PDF into `public/resumes/`
2. Add an entry at the top of `content/config.ts`
3. Set `isCurrent: true` on it and `false` on the old one
4. Rebuild and redeploy

## Deployment

### Using PM2 (Linux)

PM2 is a production process manager for Node.js. Use the included script to easily manage your application:

```bash
# Start the app (builds if needed)
bash scripts/pm2.sh start

# Restart the app
bash scripts/pm2.sh restart

# Stop the application
bash scripts/pm2.sh stop

# View application status
bash scripts/pm2.sh status

# View live logs
bash scripts/pm2.sh logs

# Remove from PM2
bash scripts/pm2.sh delete

# Setup to start on system boot
bash scripts/pm2.sh startup
```

The PM2 script will:
- Automatically install PM2 if not present
- Build the application if needed
- Create proper logging to `logs/` directory
- Handle graceful restarts
- Respect your `.env` file (PORT, NODE_ENV, etc.)

**First time setup:**
```bash
# 1. Build the project
pnpm build

# 2. Start with PM2
bash scripts/pm2.sh start

# 3. (Optional) Setup auto-start on boot
bash scripts/pm2.sh startup
# Then run the command that appears
pm2 save
```

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms (Railway, Heroku, etc.)

1. Ensure `NODE_ENV=production`
2. Set all required environment variables
3. Build: `pnpm build`
4. Start: `pnpm start` (respects PORT from .env)

## Troubleshooting

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
