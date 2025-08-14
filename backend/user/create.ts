import { api, APIError } from "encore.dev/api";
import { userDB } from "./db";
import { secret } from "encore.dev/config";
import argon2 from "argon2";

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

// Global pepper stored in Encore secrets (optional). If missing, fall back to empty string.
let passwordPepper: () => string;
try {
  passwordPepper = secret("PasswordPepper");
} catch {
  passwordPepper = () => "";
}

async function hashPasswordArgon2id(password: string): Promise<string> {
  const peppered = password + passwordPepper();
  return argon2.hash(peppered, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536, // 64 MiB
    parallelism: 1,
  });
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

      // Hash the password using Argon2id with a global pepper
      const passwordHash = await hashPasswordArgon2id(req.password);
      
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
