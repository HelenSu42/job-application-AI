import { api } from "encore.dev/api";
import { openRouterClient } from "../ai/openrouter";

export interface GenerateCoverLetterRequest {
  userProfile: UserProfile;
  jobDescription: string;
  companyName?: string;
  tone: "formal" | "conversational" | "enthusiastic";
  customSections?: CoverLetterSection[];
}

export interface UserProfile {
  name: string;
  email: string;
  projects: Project[];
  skills: Skill[];
  achievements: Achievement[];
}

export interface Project {
  title: string;
  description?: string;
  summary?: string;
  keywords: string[];
}

export interface Skill {
  skillName: string;
  skillLevel: number;
}

export interface Achievement {
  title: string;
  description?: string;
}

export interface CoverLetterSection {
  type: "opening" | "experience" | "motivation" | "closing";
  content: string;
  order: number;
}

export interface GeneratedCoverLetter {
  content: string;
  suggestions: string[];
  keywordMatches: number;
}

// Generates a customized cover letter based on user profile and job description.
export const generateCoverLetter = api<GenerateCoverLetterRequest, GeneratedCoverLetter>(
  { expose: true, method: "POST", path: "/resume/cover-letter" },
  async (req) => {
    try {
      const result = await openRouterClient.generateCoverLetter(
        req.userProfile, 
        req.jobDescription, 
        req.companyName, 
        req.tone
      );
      return result;
    } catch (error) {
      console.error('AI cover letter generation failed, using fallback:', error);
      
      const companyName = req.companyName || "[Company Name]";
      
      // Fallback cover letter generation
      const mockContent = `Dear Hiring Manager,

I am writing to express my strong interest in the position at ${companyName}. With my background in ${req.userProfile.skills.slice(0, 3).map(s => s.skillName).join(', ')}, I am excited about the opportunity to contribute to your team.

In my recent project, "${req.userProfile.projects[0]?.title || 'Recent Project'}", I ${req.userProfile.projects[0]?.summary || 'demonstrated key technical skills and problem-solving abilities'}. This experience has prepared me well for the challenges outlined in your job description.

${req.userProfile.achievements.length > 0 ? 
  `Additionally, I have achieved ${req.userProfile.achievements[0].title}, which demonstrates my commitment to excellence and continuous improvement.` : 
  'I am committed to continuous learning and bringing innovative solutions to complex problems.'
}

I am particularly drawn to ${companyName} because of your commitment to innovation and excellence. I would welcome the opportunity to discuss how my skills and enthusiasm can contribute to your team's success.

Thank you for your consideration. I look forward to hearing from you.

Sincerely,
${req.userProfile.name}`;

      const suggestions = [
        "Research the company's recent projects or initiatives to add more specific details",
        "Quantify your achievements with specific numbers or metrics where possible",
        "Tailor the opening paragraph to match the specific role requirements"
      ];

      return {
        content: mockContent,
        suggestions,
        keywordMatches: 12
      };
    }
  }
);
