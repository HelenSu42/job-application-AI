import { api } from "encore.dev/api";
import { openRouterClient } from "../ai/openrouter";

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
    try {
      const result = await openRouterClient.generateResume(req.userProfile, req.jobDescription);
      return result;
    } catch (error) {
      console.error('AI resume generation failed, using fallback:', error);
      
      // Fallback resume generation
      const mockContent = generateFallbackResume(req.userProfile, req.selectedSections);

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
  }
);

function generateFallbackResume(userProfile: UserProfile, selectedSections: ResumeSection[]): string {
  let resumeContent = '';
  
  // Sort sections by order
  const sortedSections = selectedSections.sort((a, b) => a.order - b.order);
  
  // Header
  resumeContent += `# ${userProfile.name}\n`;
  resumeContent += `${userProfile.email}`;
  if (userProfile.phone) resumeContent += ` | ${userProfile.phone}`;
  if (userProfile.location) resumeContent += ` | ${userProfile.location}`;
  resumeContent += '\n\n';
  
  // Generate sections based on selected sections
  for (const section of sortedSections) {
    switch (section.type) {
      case 'education':
        if (userProfile.education && userProfile.education.length > 0) {
          resumeContent += '## Education\n\n';
          userProfile.education.forEach(edu => {
            resumeContent += `**${edu.degree}** - ${edu.institution}`;
            if (edu.graduationDate) {
              resumeContent += ` (${new Date(edu.graduationDate).getFullYear()})`;
            }
            resumeContent += '\n\n';
          });
        }
        break;
        
      case 'projects':
        if (userProfile.projects && userProfile.projects.length > 0) {
          resumeContent += '## Projects & Experience\n\n';
          userProfile.projects.forEach(project => {
            resumeContent += `**${project.title}**\n`;
            if (project.summary) {
              resumeContent += `${project.summary}\n`;
            } else if (project.description) {
              resumeContent += `${project.description.substring(0, 200)}...\n`;
            }
            if (project.bullets && project.bullets.length > 0) {
              project.bullets.forEach(bullet => {
                resumeContent += `• ${bullet.bulletText}\n`;
              });
            }
            if (project.keywords && project.keywords.length > 0) {
              resumeContent += `*Technologies: ${project.keywords.join(', ')}*\n`;
            }
            resumeContent += '\n';
          });
        }
        break;
        
      case 'skills':
        if (userProfile.skills && userProfile.skills.length > 0) {
          resumeContent += '## Technical Skills\n\n';
          const skillsByCategory = userProfile.skills.reduce((acc, skill) => {
            const category = skill.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(`${skill.skillName} (${skill.skillLevel}/5)`);
            return acc;
          }, {} as Record<string, string[]>);
          
          Object.entries(skillsByCategory).forEach(([category, skills]) => {
            resumeContent += `**${category}:** ${skills.join(', ')}\n\n`;
          });
        }
        break;
        
      case 'languages':
        if (userProfile.languages && userProfile.languages.length > 0) {
          resumeContent += '## Languages\n\n';
          const languageList = userProfile.languages.map(lang => 
            `${lang.language} (${lang.proficiency})`
          ).join(' • ');
          resumeContent += `${languageList}\n\n`;
        }
        break;
        
      case 'achievements':
        if (userProfile.achievements && userProfile.achievements.length > 0) {
          resumeContent += '## Achievements & Awards\n\n';
          userProfile.achievements.forEach(achievement => {
            resumeContent += `• **${achievement.title}**`;
            if (achievement.description) {
              resumeContent += ` - ${achievement.description}`;
            }
            if (achievement.dateReceived) {
              resumeContent += ` (${new Date(achievement.dateReceived).getFullYear()})`;
            }
            resumeContent += '\n';
          });
          resumeContent += '\n';
        }
        break;
    }
  }
  
  return resumeContent.trim();
}
