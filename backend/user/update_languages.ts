import { api } from "encore.dev/api";
import { userDB } from "./db";

export interface UpdateLanguagesRequest {
  userId: number;
  languages: LanguageInput[];
}

export interface LanguageInput {
  language: string;
  proficiency: string;
}

export interface UpdateLanguagesResponse {
  success: boolean;
}

// Updates a user's language information.
export const updateLanguages = api<UpdateLanguagesRequest, UpdateLanguagesResponse>(
  { expose: true, method: "PUT", path: "/users/languages" },
  async (req) => {
    await userDB.exec`DELETE FROM user_languages WHERE user_id = ${req.userId}`;
    
    for (const lang of req.languages) {
      await userDB.exec`
        INSERT INTO user_languages (user_id, language, proficiency)
        VALUES (${req.userId}, ${lang.language}, ${lang.proficiency})
      `;
    }
    
    return { success: true };
  }
);
