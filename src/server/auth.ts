import { and, eq, gt, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { sessions, users, type User } from "@/db/schema";
import { Errors } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  SESSION_TTL_SECONDS,
  generateSessionToken,
  hashSessionToken,
} from "@/lib/session-token";
import { loginSchema, registerSchema } from "@/lib/validation";

export interface PublicUser {
  id: number;
  email: string;
  displayName: string;
  role: "user" | "admin";
}

export function toPublicUser(u: User): PublicUser {
  return { id: u.id, email: u.email, displayName: u.displayName, role: u.role };
}

function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export async function register(
  input: unknown,
  database: Db = getDb()
): Promise<{ user: PublicUser; token: string }> {
  const data = registerSchema.parse(input);
  const existing = database
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .get();
  if (existing) throw Errors.conflict("Bu e-posta zaten kayıtlı.");

  const passwordHash = await hashPassword(data.password);
  const role = adminEmails().has(data.email) ? "admin" : "user";

  const inserted = database
    .insert(users)
    .values({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      role,
    })
    .returning()
    .get();

  const token = createSession(inserted.id, database);
  return { user: toPublicUser(inserted), token };
}

export async function login(
  input: unknown,
  database: Db = getDb()
): Promise<{ user: PublicUser; token: string }> {
  const data = loginSchema.parse(input);
  const user = database
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .get();
  if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
    throw Errors.authFailed();
  }
  const token = createSession(user.id, database);
  return { user: toPublicUser(user), token };
}

export function createSession(userId: number, database: Db = getDb()): string {
  const token = generateSessionToken();
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  database
    .insert(sessions)
    .values({ userId, tokenHash: hashSessionToken(token), expiresAt })
    .run();
  return token;
}

export function getSessionUser(
  token: string | undefined | null,
  database: Db = getDb()
): PublicUser | null {
  if (!token) return null;
  const row = database
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, sql`(unixepoch())`)
      )
    )
    .get();
  return row ? toPublicUser(row.user) : null;
}

export function destroySession(token: string | undefined | null, database: Db = getDb()): void {
  if (!token) return;
  database
    .delete(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)))
    .run();
}

export function requireUser(token: string | undefined | null, database: Db = getDb()): PublicUser {
  const user = getSessionUser(token, database);
  if (!user) throw Errors.unauthorized();
  return user;
}

export function requireAdmin(token: string | undefined | null, database: Db = getDb()): PublicUser {
  const user = requireUser(token, database);
  if (user.role !== "admin") throw Errors.forbidden();
  return user;
}
