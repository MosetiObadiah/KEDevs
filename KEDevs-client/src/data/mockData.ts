// src/data/mockData.ts

export interface Job {
  id: string;
  title: string;
  company: string;
  companyId: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Freelance";
  workType: "Remote" | "On-site" | "Hybrid";
  tags: string[];
  upvoteCount: number;
  postedDate: string;
  isVerified: boolean;
  description:string;
  requirements: string[];
  postedById: string;
}

export interface Developer {
  id: string;
  userType: 'DEVELOPER' | 'EMPLOYER' | 'ADMIN';
  name: string;
  role: string;
  city: string;
  skills: string[];
  availability: "Available" | "Busy" | "Open to Offers";
  isVerified: boolean;
  isApproved: boolean;
  endorsementCount: number;
  bio: string;
  experience: string;
  email?: string;
  phone?: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
  visibility: "Public" | "Private" | "Hidden";
  projects: {
    title: string;
    description: string;
    techStack: string[];
    url?: string;
    screenshot?: string;
    isFeatured?: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  ossContributions: string[];
  spotlightStatus: {
    isActive: boolean;
    expiresAt?: string;
    type?: "Day" | "Week";
  };
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  city: string;
  isVerified: boolean;
  bio: string;
  website: string;
  activeJobsCount: number;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  status: "Pending" | "Reviewed" | "Accepted" | "Rejected";
  appliedDate: string;
}

export interface Notification {
  id: string;
  type: "ApplicationUpdate" | "Message" | "Upvote" | "Payment" | "Verification";
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  actionUrl?: string;
}

export const jobs: Job[] = [
  {
    id: "1",
    title: "Senior Full Stack Engineer",
    company: "TechFlow Solutions",
    companyId: "c1",
    location: "Nairobi, Kenya",
    type: "Full-time",
    workType: "Remote",
    tags: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    upvoteCount: 42,
    postedDate: "2024-05-01",
    isVerified: true,
    description: "We are looking for a Senior Full Stack Engineer to lead our core product team...",
    requirements: ["5+ years experience", "Strong TS skills", "Mentorship experience"],
    postedById: "d1",
  },
  {
    id: "2",
    title: "Backend Developer (Spring Boot)",
    company: "Fintech Horizon",
    companyId: "c2",
    location: "Lagos, Nigeria",
    type: "Contract",
    workType: "Hybrid",
    tags: ["Java", "Spring Boot", "Docker", "AWS"],
    upvoteCount: 15,
    postedDate: "2024-05-03",
    isVerified: false,
    description: "Join our fast-growing fintech team to build scalable payment gateways...",
    requirements: ["3+ years Java experience", "Understanding of microservices"],
    postedById: "d2",
  },
  {
    id: "3",
    title: "Product Designer",
    company: "Creative Pulse",
    companyId: "c3",
    location: "Cape Town, South Africa",
    type: "Freelance",
    workType: "Remote",
    tags: ["Figma", "UI/UX", "User Research"],
    upvoteCount: 8,
    postedDate: "2024-05-05",
    isVerified: true,
    description: "We need a creative designer to revamp our user journey...",
    requirements: ["Portfolio of past work", "Figma mastery"],
    postedById: "d3",
  },
];

export const developers: Developer[] = [
  {
    id: "d1",
    userType: "DEVELOPER",
    name: "Jane Doe",
    role: "Senior Frontend Engineer",
    city: "Nairobi",
    skills: ["React", "Next.js", "Tailwind", "MUI"],
    availability: "Available",
    isVerified: true,
    isApproved: true,
    endorsementCount: 156,
    bio: "Passionate about building beautiful, accessible user interfaces...",
    experience: "7 years",
    email: "jane.doe@example.com",
    github: "github.com/janedoe",
    visibility: "Public",
    languages: ["English", "Swahili"],
    education: [{ institution: "University of Nairobi", degree: "BSc Computer Science", year: "2017" }],
    certifications: ["AWS Certified Solutions Architect"],
    achievements: ["Top 1% Contributor on Stack Overflow"],
    ossContributions: ["Contributed to MUI v6 core components"],
    spotlightStatus: { isActive: false },
    projects: [
      {
        title: "E-commerce Platform",
        description: "A high-performance online store built with Next.js.",
        techStack: ["Next.js", "Stripe", "Prisma"],
        url: "https://shop.example.com",
        isFeatured: true
      },
    ],
  },
  {
    id: "d2",
    userType: "DEVELOPER",
    name: "John Smith",
    role: "DevOps Engineer",
    city: "Lagos",
    skills: ["Kubernetes", "AWS", "Terraform", "CI/CD"],
    availability: "Open to Offers",
    isVerified: false,
    isApproved: true,
    endorsementCount: 89,
    bio: "Specializing in infrastructure as code and scalable systems...",
    experience: "5 years",
    visibility: "Public",
    languages: ["English"],
    education: [],
    certifications: [],
    achievements: [],
    ossContributions: [],
    spotlightStatus: { isActive: true },
    projects: [],
  },
  {
    id: "d3",
    userType: "EMPLOYER",
    name: "Mark Employer",
    role: "Founder at TechFlow",
    city: "Nairobi",
    skills: [],
    availability: "Available",
    isVerified: false,
    isApproved: false, // For testing pending-approval
    endorsementCount: 0,
    bio: "Looking for top talent to join our mission.",
    experience: "10 years",
    email: "mark@techflow.io",
    visibility: "Public",
    languages: ["English"],
    education: [],
    certifications: [],
    achievements: [],
    ossContributions: [],
    spotlightStatus: { isActive: false },
    projects: [],
  },
  {
    id: "d4",
    userType: "ADMIN",
    name: "Admin User",
    role: "Platform Administrator",
    city: "Nairobi",
    skills: [],
    availability: "Available",
    isVerified: true,
    isApproved: true,
    endorsementCount: 0,
    bio: "Main administrator account.",
    experience: "15 years",
    email: "admin@kedevs.com",
    visibility: "Public",
    languages: ["English"],
    education: [],
    certifications: [],
    achievements: [],
    ossContributions: [],
    spotlightStatus: { isActive: false },
    projects: [],
  },
  {
    id: "d5",
    userType: "EMPLOYER",
    name: "Jane Smith (Pending)",
    role: "HR at FutureTech",
    city: "Kisumu",
    skills: [],
    availability: "Available",
    isVerified: false,
    isApproved: false,
    endorsementCount: 0,
    bio: "Looking for developers.",
    experience: "5 years",
    email: "jane@futuretech.com",
    visibility: "Public",
    languages: ["English"],
    education: [],
    certifications: [],
    achievements: [],
    ossContributions: [],
    spotlightStatus: { isActive: false },
    projects: [],
  },
];

export const companies: Company[] = [
  {
    id: "c1",
    name: "TechFlow Solutions",
    industry: "Software Development",
    size: "50-200 employees",
    city: "Nairobi",
    isVerified: true,
    bio: "Leading software solutions provider in East Africa.",
    website: "https://techflow.io",
    activeJobsCount: 5,
  },
];

export const myApplications: Application[] = [
  {
    id: "a1",
    jobId: "1",
    jobTitle: "Senior Full Stack Engineer",
    companyName: "TechFlow Solutions",
    status: "Reviewed",
    appliedDate: "2024-05-02"
  },
  {
    id: "a2",
    jobId: "2",
    jobTitle: "Backend Developer (Spring Boot)",
    companyName: "Fintech Horizon",
    status: "Pending",
    appliedDate: "2024-05-04"
  }
];

export const myNotifications: Notification[] = [
  {
    id: "n1",
    type: "ApplicationUpdate",
    title: "Application Status Updated",
    message: "Your application for 'Senior Full Stack Engineer' has been marked as Reviewed.",
    date: "2024-05-05T10:00:00Z",
    isRead: false,
    actionUrl: "/jobs/my-applications"
  },
  {
    id: "n2",
    type: "Upvote",
    title: "Job Post Upvoted",
    message: "Your job post 'Junior React Dev' received 5 new upvotes.",
    date: "2024-05-06T14:30:00Z",
    isRead: true
  }
];

export const currentUser: Developer = developers[0];
