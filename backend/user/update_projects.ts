import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateProjectsRequest {
  userId: number;
  projects: ProjectInput[];
}

export interface ProjectInput {
  title: string;
  description?: string;
  summary?: string;
  keywords: string[];
  startDate?: Date;
  endDate?: Date;
  bullets: ProjectBulletInput[];
}

export interface ProjectBulletInput {
  bulletText: string;
  targetType: string;
  keywords: string[];
}

export interface UpdateProjectsResponse {
  success: boolean;
}

// Updates a user's project information.
export const updateProjects = api<UpdateProjectsRequest, UpdateProjectsResponse>(
  { expose: true, method: "PUT", path: "/users/projects" },
  async (req) => {
    // Delete existing projects and bullets (cascade will handle bullets)
    await userDB.exec`DELETE FROM projects WHERE user_id = ${req.userId}`;
    
    for (const project of req.projects) {
      const projectResult = await userDB.queryRow<{ id: number }>`
        INSERT INTO projects (user_id, title, description, summary, keywords, start_date, end_date)
        VALUES (${req.userId}, ${project.title}, ${project.description || null}, ${project.summary || null}, 
                ${project.keywords}, ${project.startDate || null}, ${project.endDate || null})
        RETURNING id
      `;
      
      if (projectResult) {
        for (const bullet of project.bullets) {
          await userDB.exec`
            INSERT INTO project_bullets (project_id, bullet_text, target_type, keywords)
            VALUES (${projectResult.id}, ${bullet.bulletText}, ${bullet.targetType}, ${bullet.keywords})
          `;
        }
      }
    }
    
    return { success: true };
  }
);
