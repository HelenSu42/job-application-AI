import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateSkillsRequest {
  userId: number;
  skills: SkillInput[];
}

export interface SkillInput {
  skillName: string;
  skillLevel: number;
  category?: string;
}

export interface UpdateSkillsResponse {
  success: boolean;
}

// Updates a user's skills information.
export const updateSkills = api<UpdateSkillsRequest, UpdateSkillsResponse>(
  { expose: true, method: "PUT", path: "/users/skills" },
  async (req) => {
    await userDB.exec`DELETE FROM user_skills WHERE user_id = ${req.userId}`;
    
    for (const skill of req.skills) {
      await userDB.exec`
        INSERT INTO user_skills (user_id, skill_name, skill_level, category)
        VALUES (${req.userId}, ${skill.skillName}, ${skill.skillLevel}, ${skill.category || null})
      `;
    }
    
    return { success: true };
  }
);
