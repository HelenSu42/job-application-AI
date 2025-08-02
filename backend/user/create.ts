import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import crypto from "crypto";

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  phone?: string;
  location?: string;
  currentSalary?: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  location?: string;
  currentSalary?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Simple password hashing function using crypto (for demo purposes)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Creates a new user profile.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    try {
      // Check if user already exists
      const existingUser = await userDB.queryRow`
        SELECT id FROM users WHERE email = ${req.email}
      `;
      
      if (existingUser) {
        throw APIError.alreadyExists("User with this email already exists");
      }

      // Hash the password using simple crypto hash (for demo purposes)
      // In production, use bcrypt or similar
      const passwordHash = hashPassword(req.password);
      
      const user = await userDB.queryRow<User>`
        INSERT INTO users (email, name, password_hash, phone, location, current_salary)
        VALUES (${req.email}, ${req.name}, ${passwordHash}, ${req.phone || null}, ${req.location || null}, ${req.currentSalary || null})
        RETURNING id, email, name, phone, location, current_salary as "currentSalary", created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      if (!user) {
        throw APIError.internal("Failed to create user");
      }
      
      return user;
    } catch (error) {
      console.error('User creation error:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        throw APIError.alreadyExists("User with this email already exists");
      }
      throw APIError.internal("Failed to create user account");
    }
  }
);
