// COPY THIS FILE TO lib/data.ts AND FILL IN YOUR ACTUAL INFORMATION
// This file is excluded from git (.gitignore) to keep your personal data private

export const personalInfo = {
  name: "Your Name",
  firstName: "Your",
  lastName: "Name",

  title: "Your Job Title / Field",
  school: "Your University Name",
  year: "Year (e.g., First Year, Second Year)",
  expectedGraduation: "Month Year (e.g., May 2029)",

  location: "City, State",
  bio: "A brief bio describing yourself, your skills, and what you're looking for. Keep it 2-3 sentences.",

  emailAcademic: "academic@university.edu",
  emailPersonal: "personal@email.com",
  
  linkedin: "https://linkedin.com/in/yourprofile",
  github: "https://github.com/yourprofile",
}

export interface ContactMethod {
  id: "email" | "linkedin" | "github"
  label: string
  value: string
  href: string
  description?: string
}

export const contactMethods: ContactMethod[] = [
  {
    id: "email",
    label: "Email",
    value: personalInfo.emailAcademic,
    href: `mailto:${personalInfo.emailAcademic}`,
    description: "Best way to reach me for opportunities.",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "yourprofile",
    href: personalInfo.linkedin,
    description: "Connect with me professionally.",
  },
  {
    id: "github",
    label: "GitHub",
    value: "yourprofile",
    href: personalInfo.github,
    description: "Check out my code and contributions.",
  },
]

export interface Project {
  title: string
  description: string
  tags: string[]
  githubUrl: string
  liveUrl?: string
  featured?: boolean
  type: "Personal" | "Academic"
}

// Add new projects by adding an object to this array
export const projects: Project[] = [
  {
    title: "Example Project 1",
    description:
      "A brief description of what this project does, the technologies used, and the impact it had. Keep it 2-3 sentences.",
    tags: ["React", "Node.js", "PostgreSQL", "TypeScript"],
    githubUrl: "https://github.com/yourprofile/project1",
    liveUrl: "https://example.com",
    featured: true,
    type: "Personal",
  },
  {
    title: "Example Project 2",
    description:
      "Another example project. This one is marked as Academic. You can have multiple projects.",
    tags: ["Python", "Django", "SQLite"],
    githubUrl: "https://github.com/yourprofile/project2",
    featured: false,
    type: "Academic",
  },
]

export interface Skill {
  category: string
  items: string[]
}

export const skills: Skill[] = [
  {
    category: "Languages",
    items: ["Python", "JavaScript", "TypeScript", "Java", "SQL"],
  },
  {
    category: "Frameworks & Libraries",
    items: ["React", "Node.js", "Django", "Next.js"],
  },
  {
    category: "Tools & Technologies",
    items: ["Git", "Docker", "AWS", "PostgreSQL", "MongoDB"],
  },
  {
    category: "Development Practices",
    items: ["REST API", "Object-Oriented Design", "Agile/Scrum"],
  },
]

export interface Course {
  name: string
  code?: string
  termLabel?: string
}

export interface Education {
  degree: string
  major?: string
  institution: string
  location: string
  graduationDate: string
  relevantCourses?: Course[]
  details?: string
  termSystem?: "Semester" | "Quarter"
}

export const education: Education[] = [
  {
    degree: "Bachelor of Science",
    major: "Computer Science",
    institution: "Your University",
    location: "City, State",
    graduationDate: "May 2025",
    termSystem: "Semester",
    relevantCourses: [
      { name: "Data Structures", code: "CS-201", termLabel: "Spring 2024" },
      { name: "Algorithms", code: "CS-301", termLabel: "Fall 2024" },
      { name: "Web Development", code: "CS-401", termLabel: "Spring 2025" },
    ],
  },
  {
    degree: "High School Diploma",
    institution: "Your High School",
    location: "City, State",
    graduationDate: "June 2021",
    termSystem: "Semester",
  },
]

export interface WorkExperience {
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current?: boolean
  description?: string[]
}

export const workExperience: WorkExperience[] = [
  {
    title: "Software Engineer",
    company: "Your Company",
    location: "City, State",
    startDate: "June 2024",
    endDate: "Present",
    current: true,
    description: [
      "Brief description of your responsibilities.",
      "Impact you had on the company or project.",
      "Technologies you used or skills you developed.",
    ],
  },
  {
    title: "Intern",
    company: "Previous Company",
    location: "City, State",
    startDate: "June 2023",
    endDate: "August 2023",
    description: [
      "What you worked on during this role.",
      "Key projects or accomplishments.",
    ],
  },
]

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "/contact" },
]
