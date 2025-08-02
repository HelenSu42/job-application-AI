import { api } from "encore.dev/api";

export interface GenerateResumeRequest {
  userProfile: UserProfile;
  jobDescription?: string;
  template: "modern" | "classic" | "minimal";
  selectedSections: ResumeSection[];
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  achievements: Achievement[];
}

export interface Education {
  institution: string;
  degree: string;
  graduationDate?: Date;
}

export interface Skill {
  skillName: string;
  skillLevel: number;
  category?: string;
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Project {
  title: string;
  description?: string;
  summary?: string;
  keywords: string[];
  startDate?: Date;
  endDate?: Date;
  bullets: ProjectBullet[];
}

export interface ProjectBullet {
  bulletText: string;
  targetType: string;
  keywords: string[];
}

export interface Achievement {
  title: string;
  description?: string;
  dateReceived?: Date;
}

export interface ResumeSection {
  type: "contact" | "education" | "projects" | "skills" | "languages" | "achievements";
  order: number;
  items?: any[];
}

export interface GeneratedResume {
  content: string;
  optimizationSuggestions: OptimizationSuggestion[];
  atsScore: number;
}

export interface OptimizationSuggestion {
  type: "keyword" | "format" | "length" | "content";
  message: string;
  priority: "high" | "medium" | "low";
}

// Generates a customized resume based on user profile and job requirements.
export const generate = api<GenerateResumeRequest, GeneratedResume>(
  { expose: true, method: "POST", path: "/resume/generate" },
  async (req) => {
    // Mock resume generation - in real implementation, this would create actual resume content
    const mockContent = `
# ${req.userProfile.name}
${req.userProfile.email} | ${req.userProfile.phone || ''} | ${req.userProfile.location || ''}

## Education
${req.userProfile.education.map(edu => 
  `**${edu.degree}** - ${edu.institution} (${edu.graduationDate?.getFullYear() || 'Present'})`
).join('\n')}

## Projects
${req.userProfile.projects.map(project => 
  `**${project.title}**\n${project.summary || project.description || ''}\n${project.bullets.map(b => `• ${b.bulletText}`).join('\n')}`
).join('\n\n')}

## Skills
${req.userProfile.skills.map(skill => 
  `${skill.skillName} (${skill.skillLevel}/5)`
).join(' • ')}

## Languages
${req.userProfile.languages.map(lang => 
  `${lang.language} (${lang.proficiency})`
).join(' • ')}
    `.trim();

    const optimizationSuggestions: OptimizationSuggestion[] = [
      {
        type: "keyword",
        message: "Consider adding more industry-specific keywords from the job description",
        priority: "high"
      },
      {
        type: "length",
        message: "Resume is well within the recommended 1-2 page limit",
        priority: "low"
      },
      {
        type: "format",
        message: "Use consistent bullet point formatting throughout",
        priority: "medium"
      }
    ];

    return {
      content: mockContent,
      optimizationSuggestions,
      atsScore: 85
    };
  }
);
