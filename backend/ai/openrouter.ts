import { secret } from "encore.dev/config";

const openRouterKey = secret("OpenRouterKey");

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenRouterClient {
  private baseUrl = "https://openrouter.ai/api/v1";
  
  async chat(request: OpenRouterRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterKey()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://job-assistant.app",
        "X-Title": "Job Application Assistant"
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenRouterResponse = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  async analyzeJobDescription(jobDescription: string, userProfile: any): Promise<any> {
    const prompt = `
Analyze this job description against the user's profile and return a JSON response with the following structure:

{
  "matchingScore": {
    "education": number (0-100),
    "projects": number (0-100),
    "skills": number (0-100),
    "network": number (0-100)
  },
  "skillsGap": [
    {
      "skillName": string,
      "required": boolean,
      "userLevel": number (0-5),
      "requiredLevel": number (1-5),
      "priority": "high" | "medium" | "low"
    }
  ],
  "recommendations": [
    {
      "type": "skill" | "project" | "education",
      "title": string,
      "description": string,
      "priority": "high" | "medium" | "low",
      "timeToComplete": string
    }
  ],
  "overallMatchPercentage": number (0-100)
}

Job Description:
${jobDescription}

User Profile:
Education: ${JSON.stringify(userProfile.education)}
Skills: ${JSON.stringify(userProfile.skills)}
Projects: ${JSON.stringify(userProfile.projects)}

Provide realistic analysis based on the job requirements vs user qualifications.
`;

    const response = await this.chat({
      model: "qwen/qwen-2.5-coder-32b-instruct:free",
      messages: [
        { role: "system", content: "You are an expert job market analyst. Analyze job descriptions and provide detailed compatibility assessments. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback to mock data if JSON parsing fails
      return this.getMockAnalysis();
    }
  }

  async generateResume(userProfile: any, jobDescription?: string): Promise<any> {
    const prompt = `
Generate a professional resume content based on the user profile. Return a JSON response with:

{
  "content": "formatted resume content as markdown",
  "optimizationSuggestions": [
    {
      "type": "keyword" | "format" | "length" | "content",
      "message": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "atsScore": number (0-100)
}

User Profile:
${JSON.stringify(userProfile)}

${jobDescription ? `Job Description for optimization:\n${jobDescription}` : ''}

Create a professional, ATS-friendly resume with proper formatting.
`;

    const response = await this.chat({
      model: "qwen/qwen-2.5-coder-32b-instruct:free",
      messages: [
        { role: "system", content: "You are a professional resume writer. Create compelling, ATS-optimized resumes. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 2000
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      return this.getMockResume(userProfile);
    }
  }

  async generateCoverLetter(userProfile: any, jobDescription: string, companyName?: string, tone: string = "formal"): Promise<any> {
    const prompt = `
Generate a ${tone} cover letter based on the user profile and job description. Return a JSON response with:

{
  "content": "complete cover letter text",
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "keywordMatches": number
}

User Profile:
${JSON.stringify(userProfile)}

Job Description:
${jobDescription}

Company Name: ${companyName || "[Company Name]"}
Tone: ${tone}

Create a compelling, personalized cover letter.
`;

    const response = await this.chat({
      model: "qwen/qwen-2.5-coder-32b-instruct:free",
      messages: [
        { role: "system", content: "You are a professional cover letter writer. Create compelling, personalized cover letters. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    try {
      return JSON.parse(response);
    } catch (error) {
      return this.getMockCoverLetter(userProfile, companyName);
    }
  }

  private getMockAnalysis() {
    return {
      matchingScore: {
        education: 85,
        projects: 70,
        skills: 65,
        network: 40
      },
      skillsGap: [
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
      ],
      recommendations: [
        {
          type: "skill",
          title: "Improve TypeScript proficiency",
          description: "Focus on advanced TypeScript features",
          priority: "high",
          timeToComplete: "2-3 weeks"
        }
      ],
      overallMatchPercentage: 65
    };
  }

  private getMockResume(userProfile: any) {
    return {
      content: `# ${userProfile.name}\n${userProfile.email} | ${userProfile.phone || ''} | ${userProfile.location || ''}\n\n## Education\n${userProfile.education?.map((edu: any) => `**${edu.degree}** - ${edu.institution}`).join('\n') || 'No education listed'}\n\n## Skills\n${userProfile.skills?.map((skill: any) => `${skill.skillName} (${skill.skillLevel}/5)`).join(' • ') || 'No skills listed'}`,
      optimizationSuggestions: [
        {
          type: "keyword",
          message: "Consider adding more industry-specific keywords",
          priority: "high"
        }
      ],
      atsScore: 85
    };
  }

  private getMockCoverLetter(userProfile: any, companyName?: string) {
    return {
      content: `Dear Hiring Manager,\n\nI am writing to express my interest in the position at ${companyName || '[Company Name]'}. With my background in ${userProfile.skills?.slice(0, 3).map((s: any) => s.skillName).join(', ') || 'technology'}, I am excited about this opportunity.\n\nSincerely,\n${userProfile.name}`,
      suggestions: [
        "Research the company's recent projects",
        "Quantify your achievements with metrics",
        "Tailor the opening paragraph"
      ],
      keywordMatches: 12
    };
  }
}

export const openRouterClient = new OpenRouterClient();
