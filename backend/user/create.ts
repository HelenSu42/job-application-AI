import { api } from "encore.dev/api";
import { userDB } from "./db";
import bcrypt from "bcrypt";

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

// Creates a new user profile.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    // Check if user already exists
    const existingUser = await userDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;
    
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash the password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(req.password, saltRounds);
    
    const user = await userDB.queryRow<User>`
      INSERT INTO users (email, name, password_hash, phone, location, current_salary)
      VALUES (${req.email}, ${req.name}, ${passwordHash}, ${req.phone || null}, ${req.location || null}, ${req.currentSalary || null})
      RETURNING id, email, name, phone, location, current_salary as "currentSalary", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return user;
  }
);
