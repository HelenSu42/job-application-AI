import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateAchievementsRequest {
  userId: number;
  achievements: AchievementInput[];
}

export interface AchievementInput {
  title: string;
  description?: string;
  dateReceived?: Date;
}

export interface UpdateAchievementsResponse {
  success: boolean;
}

// Updates a user's achievements information.
export const updateAchievements = api<UpdateAchievementsRequest, UpdateAchievementsResponse>(
  { expose: true, method: "PUT", path: "/users/achievements" },
  async (req) => {
    await userDB.exec`DELETE FROM achievements WHERE user_id = ${req.userId}`;
    
    for (const achievement of req.achievements) {
      await userDB.exec`
        INSERT INTO achievements (user_id, title, description, date_received)
        VALUES (${req.userId}, ${achievement.title}, ${achievement.description || null}, ${achievement.dateReceived || null})
      `;
    }
    
    return { success: true };
  }
);
