import { api, APIError } from "encore.dev/api";
import { userDB } from "../user/db";
import { authDB } from "./db";
import crypto from "crypto";
import { secret } from "encore.dev/config";
import argon2 from "argon2";

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

// Global pepper stored in Encore secrets (optional). If missing, fall back to empty string.
let passwordPepper: () => string;
try {
  passwordPepper = secret("PasswordPepper");
} catch {
  passwordPepper = () => "1";
}

export async function verifyPasswordArgon2id(password: string, hash: string): Promise<boolean> {
  const peppered = password + passwordPepper();
  try {
    return await argon2.verify(hash, peppered, { type: argon2.argon2id });
  } catch {
    return false;
  }
}

export async function hashPasswordArgon2id(password: string): Promise<string> {
  const peppered = password + passwordPepper();
  return argon2.hash(peppered, {
    type: argon2.argon2id,
    timeCost: 3,
    memoryCost: 65536,
    parallelism: 1,
  });
}

function legacySha256(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function authenticateUser(req: LoginRequest): Promise<LoginResponse> {
  // Find user by email
  const user = await userDB.queryRow`
    SELECT id, name, email, password_hash FROM users WHERE email = ${req.email}
  `;
  
  if (!user) {
    throw APIError.unauthenticated("Invalid email or password");
  }

  // Verify password with Argon2id and global pepper
  let isValid = user.password_hash
    ? await verifyPasswordArgon2id(req.password, user.password_hash)
    : false;

  // Backward-compatible support for legacy SHA-256 hashes; upgrade on successful login
  if (!isValid) {
    const legacy = legacySha256(req.password);
    if (user.password_hash && user.password_hash === legacy) {
      isValid = true;
      const newHash = await hashPasswordArgon2id(req.password);
      await userDB.exec`
        UPDATE users SET password_hash = ${newHash} WHERE id = ${user.id}
      `;
    }
  }

  if (!isValid) {
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

// Logs in a user with email and password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  authenticateUser
);
