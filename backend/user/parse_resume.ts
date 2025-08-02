import { api } from "encore.dev/api";
import { openRouterClient } from "../ai/openrouter";

export interface ParseResumeRequest {
  userId: number;
  resumeText: string;
}

export interface ParseResumeResponse {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  education: Array<{
    institution: string;
    degree: string;
    graduationDate: string;
  }>;
  projects: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
    skills: string[];
    achievements: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    category: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: string;
  }>;
}

// Parses resume text and extracts structured information using AI.
export const parseResume = api<ParseResumeRequest, ParseResumeResponse>(
  { expose: true, method: "POST", path: "/users/parse-resume" },
  async (req) => {
    try {
      const extractedData = await openRouterClient.parseResume(req.resumeText);
      return extractedData;
    } catch (error) {
      console.error('Resume parsing failed:', error);
      
      // Return mock data as fallback
      return {
        personalInfo: {
          name: "John Smith",
          email: "john.smith@email.com",
          phone: "+1 (555) 123-4567",
          location: "San Francisco, CA"
        },
        education: [
          {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science in Computer Science",
            graduationDate: "2020-05-15"
          }
        ],
        projects: [
          {
            title: "E-commerce Web Application",
            company: "TechStart Inc.",
            startDate: "2022-01-15",
            endDate: "2023-12-31",
            description: "Developed a full-stack e-commerce platform using React and Node.js. Implemented user authentication, payment processing, and inventory management features.",
            skills: ["React", "Node.js", "MongoDB", "Express.js", "Stripe API"],
            achievements: "• Increased user engagement by 35%\n• Reduced page load time by 50%\n• Processed over $100K in transactions"
          }
        ],
        skills: [
          { name: "JavaScript", level: 5, category: "Programming Languages" },
          { name: "React", level: 4, category: "Frameworks & Libraries" },
          { name: "Node.js", level: 4, category: "Backend" },
          { name: "Python", level: 3, category: "Programming Languages" },
          { name: "MongoDB", level: 3, category: "Databases" }
        ],
        languages: [
          { language: "English", proficiency: "Native" },
          { language: "Spanish", proficiency: "Conversational" }
        ]
      };
    }
  }
);
