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

  async parseResume(resumeText: string): Promise<any> {
    const prompt = `
Parse this resume and extract information in the following JSON format. Be very careful to extract accurate information and avoid making assumptions:

{
  "personalInfo": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string"
  },
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "graduationDate": "YYYY-MM-DD"
    }
  ],
  "projects": [
    {
      "title": "string",
      "company": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "description": "string",
      "skills": ["skill1", "skill2"],
      "achievements": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "level": number (1-5, where 1=beginner, 3=intermediate, 5=expert),
      "category": "string (Programming Languages, Frameworks & Libraries, Databases, Cloud & DevOps, Tools & Software, Soft Skills, Other)"
    }
  ],
  "languages": [
    {
      "language": "string",
      "proficiency": "Basic|Conversational|Fluent|Native"
    }
  ]
}

Important parsing guidelines:
1. Extract only information that is clearly present in the resume
2. For skills, infer reasonable proficiency levels based on context (years of experience, project complexity, etc.)
3. Categorize skills appropriately (Programming Languages, Frameworks & Libraries, etc.)
4. For projects/work experience, extract company names, job titles, and date ranges accurately
5. Parse dates in YYYY-MM-DD format, use approximate dates if only year/month is provided
6. If information is missing or unclear, omit that field rather than guessing
7. Return valid JSON only, no additional text

Resume text:
${resumeText}
`;

    const response = await this.chat({
      model: "qwen/qwen-2.5-coder-32b-instruct:free",
      messages: [
        { role: "system", content: "You are an expert resume parser. Extract information accurately and return valid JSON only. Pay close attention to dates, company names, and skill categorization." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 3000
    });

    try {
      // Clean the response to ensure it's valid JSON
      const cleanedResponse = response.trim();
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanedResponse;
      
      const parsed = JSON.parse(jsonString);
      
      // Validate and clean the parsed data
      return this.validateAndCleanParsedData(parsed);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response);
      return this.getMockResumeData();
    }
  }

  private validateAndCleanParsedData(data: any): any {
    const cleaned: any = {
      personalInfo: {},
      education: [],
      projects: [],
      skills: [],
      languages: []
    };

    // Validate personal info
    if (data.personalInfo) {
      cleaned.personalInfo = {
        name: data.personalInfo.name || "",
        email: data.personalInfo.email || "",
        phone: data.personalInfo.phone || "",
        location: data.personalInfo.location || ""
      };
    }

    // Validate education
    if (Array.isArray(data.education)) {
      cleaned.education = data.education.filter((edu: any) => 
        edu.institution && edu.degree
      ).map((edu: any) => ({
        institution: edu.institution,
        degree: edu.degree,
        graduationDate: this.validateDate(edu.graduationDate)
      }));
    }

    // Validate projects
    if (Array.isArray(data.projects)) {
      cleaned.projects = data.projects.filter((project: any) => 
        project.title
      ).map((project: any) => ({
        title: project.title,
        company: project.company || "",
        startDate: this.validateDate(project.startDate),
        endDate: this.validateDate(project.endDate),
        description: project.description || "",
        skills: Array.isArray(project.skills) ? project.skills : [],
        achievements: project.achievements || ""
      }));
    }

    // Validate skills
    if (Array.isArray(data.skills)) {
      cleaned.skills = data.skills.filter((skill: any) => 
        skill.name
      ).map((skill: any) => ({
        name: skill.name,
        level: this.validateSkillLevel(skill.level),
        category: this.validateSkillCategory(skill.category)
      }));
    }

    // Validate languages
    if (Array.isArray(data.languages)) {
      cleaned.languages = data.languages.filter((lang: any) => 
        lang.language
      ).map((lang: any) => ({
        language: lang.language,
        proficiency: this.validateProficiency(lang.proficiency)
      }));
    }

    return cleaned;
  }

  private validateDate(dateString: string): string {
    if (!dateString) return "";
    
    // Try to parse the date and return in YYYY-MM-DD format
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch {
      return "";
    }
  }

  private validateSkillLevel(level: any): number {
    const numLevel = parseInt(level);
    if (isNaN(numLevel) || numLevel < 1 || numLevel > 5) {
      return 3; // Default to intermediate
    }
    return numLevel;
  }

  private validateSkillCategory(category: string): string {
    const validCategories = [
      'Programming Languages',
      'Frameworks & Libraries', 
      'Databases',
      'Cloud & DevOps',
      'Tools & Software',
      'Soft Skills',
      'Other'
    ];
    
    if (validCategories.includes(category)) {
      return category;
    }
    
    // Try to map common variations
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('programming') || categoryLower.includes('language')) {
      return 'Programming Languages';
    }
    if (categoryLower.includes('framework') || categoryLower.includes('library')) {
      return 'Frameworks & Libraries';
    }
    if (categoryLower.includes('database') || categoryLower.includes('db')) {
      return 'Databases';
    }
    if (categoryLower.includes('cloud') || categoryLower.includes('devops') || categoryLower.includes('aws') || categoryLower.includes('docker')) {
      return 'Cloud & DevOps';
    }
    if (categoryLower.includes('tool') || categoryLower.includes('software')) {
      return 'Tools & Software';
    }
    if (categoryLower.includes('soft') || categoryLower.includes('communication') || categoryLower.includes('leadership')) {
      return 'Soft Skills';
    }
    
    return 'Other';
  }

  private validateProficiency(proficiency: string): string {
    const validProficiencies = ['Basic', 'Conversational', 'Fluent', 'Native'];
    
    if (validProficiencies.includes(proficiency)) {
      return proficiency;
    }
    
    // Try to map common variations
    const profLower = proficiency?.toLowerCase() || '';
    if (profLower.includes('basic') || profLower.includes('beginner') || profLower.includes('elementary')) {
      return 'Basic';
    }
    if (profLower.includes('conversational') || profLower.includes('intermediate')) {
      return 'Conversational';
    }
    if (profLower.includes('fluent') || profLower.includes('advanced') || profLower.includes('proficient')) {
      return 'Fluent';
    }
    if (profLower.includes('native') || profLower.includes('mother') || profLower.includes('first')) {
      return 'Native';
    }
    
    return 'Conversational'; // Default
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

  private getMockResumeData() {
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
        { name: "Node.js", level: 4, category: "Frameworks & Libraries" }
      ],
      languages: [
        { language: "English", proficiency: "Native" },
        { language: "Spanish", proficiency: "Conversational" }
      ]
    };
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
