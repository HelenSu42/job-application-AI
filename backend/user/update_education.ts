import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateEducationRequest {
  userId: number;
  education: EducationInput[];
}

export interface EducationInput {
  id?: number;
  institution: string;
  degree: string;
  graduationDate?: Date;
}

export interface UpdateEducationResponse {
  success: boolean;
}

// Updates a user's education information.
export const updateEducation = api<UpdateEducationRequest, UpdateEducationResponse>(
  { expose: true, method: "PUT", path: "/users/education" },
  async (req) => {
    await userDB.exec`DELETE FROM education WHERE user_id = ${req.userId}`;
    
    for (const edu of req.education) {
      await userDB.exec`
        INSERT INTO education (user_id, institution, degree, graduation_date)
        VALUES (${req.userId}, ${edu.institution}, ${edu.degree}, ${edu.graduationDate || null})
      `;
    }
    
    return { success: true };
  }
);
