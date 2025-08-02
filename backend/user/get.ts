import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";

export interface GetUserParams {
  id: number;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  currentSalary?: number;
  education: Education[];
  skills: Skill[];
  languages: Language[];
  projects: Project[];
  achievements: Achievement[];
}

export interface Education {
  id: number;
  institution: string;
  degree: string;
  graduationDate?: Date;
}

export interface Skill {
  id: number;
  skillName: string;
  skillLevel: number;
  category?: string;
}

export interface Language {
  id: number;
  language: string;
  proficiency: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  summary?: string;
  keywords: string[];
  startDate?: Date;
  endDate?: Date;
  bullets: ProjectBullet[];
}

export interface ProjectBullet {
  id: number;
  bulletText: string;
  targetType: string;
  keywords: string[];
}

export interface Achievement {
  id: number;
  title: string;
  description?: string;
  dateReceived?: Date;
}

// Retrieves a user's complete profile.
export const get = api<GetUserParams, UserProfile>(
  { expose: true, method: "GET", path: "/users/:id" },
  async (params) => {
    const user = await userDB.queryRow`
      SELECT id, email, name, phone, location, current_salary as "currentSalary"
      FROM users WHERE id = ${params.id}
    `;
    
    if (!user) {
      throw APIError.notFound("User not found");
    }

    const education = await userDB.queryAll<Education>`
      SELECT id, institution, degree, graduation_date as "graduationDate"
      FROM education WHERE user_id = ${params.id}
      ORDER BY graduation_date DESC
    `;

    const skills = await userDB.queryAll<Skill>`
      SELECT id, skill_name as "skillName", skill_level as "skillLevel", category
      FROM user_skills WHERE user_id = ${params.id}
      ORDER BY category, skill_name
    `;

    const languages = await userDB.queryAll<Language>`
      SELECT id, language, proficiency
      FROM user_languages WHERE user_id = ${params.id}
      ORDER BY language
    `;

    const projects = await userDB.queryAll`
      SELECT id, title, description, summary, keywords, start_date as "startDate", end_date as "endDate"
      FROM projects WHERE user_id = ${params.id}
      ORDER BY start_date DESC
    `;

    const achievements = await userDB.queryAll<Achievement>`
      SELECT id, title, description, date_received as "dateReceived"
      FROM achievements WHERE user_id = ${params.id}
      ORDER BY date_received DESC
    `;

    // Get bullets for each project
    const projectsWithBullets: Project[] = [];
    for (const project of projects) {
      const bullets = await userDB.queryAll<ProjectBullet>`
        SELECT id, bullet_text as "bulletText", target_type as "targetType", keywords
        FROM project_bullets WHERE project_id = ${project.id}
        ORDER BY id
      `;
      projectsWithBullets.push({ ...project, bullets });
    }

    return {
      ...user,
      education,
      skills,
      languages,
      projects: projectsWithBullets,
      achievements,
    };
  }
);
