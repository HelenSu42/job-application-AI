import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";
import { userDB } from "../user/db";

export interface VerifySessionRequest {
  sessionToken: string;
}

export interface VerifySessionResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// Verifies a session token and returns user information.
export const verifySession = api<VerifySessionRequest, VerifySessionResponse>(
  { expose: true, method: "POST", path: "/auth/verify" },
  async (req) => {
    const session = await authDB.queryRow`
      SELECT user_id, expires_at FROM user_sessions 
      WHERE session_token = ${req.sessionToken}
    `;
    
    if (!session) {
      throw APIError.unauthenticated("Invalid session token");
    }

    if (new Date() > session.expires_at) {
      // Clean up expired session
      await authDB.exec`
        DELETE FROM user_sessions WHERE session_token = ${req.sessionToken}
      `;
      throw APIError.unauthenticated("Session expired");
    }

    const user = await userDB.queryRow`
      SELECT id, name, email FROM users WHERE id = ${session.user_id}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("User not found");
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
);
