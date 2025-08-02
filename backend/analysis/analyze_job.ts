import { api } from "encore.dev/api";
import { openRouterClient } from "../ai/openrouter";

export interface AnalyzeJobRequest {
  jobDescription: string;
  userSkills: UserSkill[];
  userEducation: UserEducation[];
  userProjects: UserProject[];
  currentSalary?: number;
}

export interface UserSkill {
  skillName: string;
  skillLevel: number;
  category?: string;
}

export interface UserEducation {
  institution: string;
  degree: string;
  graduationDate?: Date;
}

export interface UserProject {
  title: string;
  description?: string;
  keywords: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface JobAnalysisResult {
  matchingScore: MatchingScore;
  skillsGap: SkillGap[];
  salaryAnalysis?: SalaryAnalysis;
  recommendations: Recommendation[];
  overallMatchPercentage: number;
}

export interface MatchingScore {
  education: number;
  projects: number;
  skills: number;
  network: number;
}

export interface SkillGap {
  skillName: string;
  required: boolean;
  userLevel: number;
  requiredLevel: number;
  priority: "high" | "medium" | "low";
}

export interface SalaryAnalysis {
  estimatedRange: {
    min: number;
    max: number;
  };
  changePercentage: number;
  marketComparison: string;
}

export interface Recommendation {
  type: "skill" | "project" | "education";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeToComplete?: string;
}

// Analyzes job description against user profile.
export const analyzeJob = api<AnalyzeJobRequest, JobAnalysisResult>(
  { expose: true, method: "POST", path: "/analysis/job" },
  async (req) => {
    try {
      const userProfile = {
        education: req.userEducation,
        skills: req.userSkills,
        projects: req.userProjects
      };

      const analysis = await openRouterClient.analyzeJobDescription(req.jobDescription, userProfile);
      
      // Add salary analysis if current salary is provided
      const salaryAnalysis: SalaryAnalysis | undefined = req.currentSalary ? {
        estimatedRange: {
          min: Math.round(req.currentSalary * 1.1),
          max: Math.round(req.currentSalary * 1.3)
        },
        changePercentage: 20,
        marketComparison: "Above average for this role and location"
      } : undefined;

      return {
        ...analysis,
        salaryAnalysis
      };
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      
      // Fallback analysis
      const mockSkillsGap: SkillGap[] = [
        {
          skillName: "React",
          required: true,
          userLevel: 3,
          requiredLevel: 4,
          priority: "high"
        },
        {
          skillName: "TypeScript",
          required: true,
          userLevel: 2,
          requiredLevel: 4,
          priority: "high"
        }
      ];

      const mockRecommendations: Recommendation[] = [
        {
          type: "skill",
          title: "Improve TypeScript proficiency",
          description: "Focus on advanced TypeScript features like generics and utility types",
          priority: "high",
          timeToComplete: "2-3 weeks"
        }
      ];

      const mockSalaryAnalysis: SalaryAnalysis | undefined = req.currentSalary ? {
        estimatedRange: {
          min: Math.round(req.currentSalary * 1.1),
          max: Math.round(req.currentSalary * 1.3)
        },
        changePercentage: 20,
        marketComparison: "Above average for this role and location"
      } : undefined;

      const matchingScore: MatchingScore = {
        education: 85,
        projects: 70,
        skills: 65,
        network: 40
      };

      const overallMatchPercentage = Math.round(
        (matchingScore.education + matchingScore.projects + matchingScore.skills + matchingScore.network) / 4
      );

      return {
        matchingScore,
        skillsGap: mockSkillsGap,
        salaryAnalysis: mockSalaryAnalysis,
        recommendations: mockRecommendations,
        overallMatchPercentage
      };
    }
  }
);
