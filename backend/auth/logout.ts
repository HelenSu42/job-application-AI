import { api } from "encore.dev/api";
import { authDB } from "./db";

export interface LogoutRequest {
  sessionToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

// Logs out a user by invalidating their session.
export const logout = api<LogoutRequest, LogoutResponse>(
  { expose: true, method: "POST", path: "/auth/logout" },
  async (req) => {
    await authDB.exec`
      DELETE FROM user_sessions WHERE session_token = ${req.sessionToken}
    `;
    
    return { success: true };
  }
);
