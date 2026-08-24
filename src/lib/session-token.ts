import { createHash, randomBytes } from "node:crypto";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
