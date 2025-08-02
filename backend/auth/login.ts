import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    name: string;
    email: string;
  };
  sessionToken: string;
}

// Logs in a user with email and password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    // Find user by email
    const user = await userDB.queryRow`
      SELECT id, name, email, password_hash FROM users WHERE email = ${req.email}
    `;
    
    if (!user) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(req.password, user.password_hash);
    if (!isValidPassword) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session
    await userDB.exec`
      INSERT INTO user_sessions (user_id, session_token, expires_at)
      VALUES (${user.id}, ${sessionToken}, ${expiresAt})
    `;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      sessionToken
    };
  }
);
