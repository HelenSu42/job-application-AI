import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";
import { authDB } from "./db";
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

// Simple password hashing function using crypto (for demo purposes)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
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

    // For demo purposes, we'll use a simple hash comparison
    // In production, use bcrypt or similar
    const hashedInputPassword = hashPassword(req.password);
    
    if (!user.password_hash || user.password_hash !== hashedInputPassword) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session in auth database
    await authDB.exec`
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
