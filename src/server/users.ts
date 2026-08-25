import { eq, desc, sql } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { users, deals, comments, reports, favorites } from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { PublicUser } from "@/server/auth";
import { listDeals, type DealListItem } from "@/server/deals";
import { listUserFavorites } from "@/server/favorites";

export interface UserProfileData {
  user: {
    id: number;
    email: string;
    displayName: string;
    role: "user" | "admin";
    avatar: string | null;
    bio: string | null;
    createdAt: number;
  };
  sharedDeals: DealListItem[];
  favoriteDeals: DealListItem[];
}

export async function getUserProfile(userId: number, database: Db = getDb()): Promise<UserProfileData> {
  if (!Number.isInteger(userId) || userId <= 0) throw Errors.badRequest("Geçersiz kullanıcı.");

  const user = database
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      avatar: users.avatar,
      bio: users.bio,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) throw Errors.notFound("Kullanıcı");

  const shared = await listDeals({ includeInactive: true }, database);
  const userShared = shared.items.filter((d) => d.id); // all items
  const userFavorites = listUserFavorites(userId, database);

  return {
    user,
    sharedDeals: userShared,
    favoriteDeals: userFavorites,
  };
}

export function updateUserProfile(
  userId: number,
  data: { displayName?: string; bio?: string; avatar?: string },
  database: Db = getDb()
): void {
  if (!Number.isInteger(userId) || userId <= 0) throw Errors.badRequest("Geçersiz kullanıcı.");

  const updates: Record<string, unknown> = {};
  if (data.displayName !== undefined) {
    const trimmed = data.displayName.trim();
    if (trimmed.length < 2 || trimmed.length > 40) {
      throw Errors.validation("İsim 2-40 karakter arasında olmalıdır.");
    }
    updates.displayName = trimmed;
  }
  if (data.bio !== undefined) {
    updates.bio = data.bio.trim().slice(0, 300) || null;
  }
  if (data.avatar !== undefined) {
    updates.avatar = data.avatar.trim() || null;
  }

  if (Object.keys(updates).length > 0) {
    database.update(users).set(updates).where(eq(users.id, userId)).run();
  }
}

export interface AdminStats {
  totalDeals: number;
  activeDeals: number;
  totalUsers: number;
  totalComments: number;
  openReports: number;
  totalFavorites: number;
}

export function adminGetStats(adminUser: PublicUser, database: Db = getDb()): AdminStats {
  if (adminUser.role !== "admin") throw Errors.forbidden();

  const totalDeals = database.select({ c: sql<number>`COUNT(*)` }).from(deals).get()?.c ?? 0;
  const activeDeals = database.select({ c: sql<number>`COUNT(*)` }).from(deals).where(eq(deals.status, "active")).get()?.c ?? 0;
  const totalUsers = database.select({ c: sql<number>`COUNT(*)` }).from(users).get()?.c ?? 0;
  const totalComments = database.select({ c: sql<number>`COUNT(*)` }).from(comments).get()?.c ?? 0;
  const openReports = database.select({ c: sql<number>`COUNT(*)` }).from(reports).where(eq(reports.status, "open")).get()?.c ?? 0;
  const totalFavorites = database.select({ c: sql<number>`COUNT(*)` }).from(favorites).get()?.c ?? 0;

  return {
    totalDeals,
    activeDeals,
    totalUsers,
    totalComments,
    openReports,
    totalFavorites,
  };
}

export function adminListUsers(adminUser: PublicUser, database: Db = getDb()) {
  if (adminUser.role !== "admin") throw Errors.forbidden();

  return database
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      role: users.role,
      isBanned: users.isBanned,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .all();
}

export function adminToggleBanUser(
  targetUserId: number,
  adminUser: PublicUser,
  database: Db = getDb()
): { isBanned: boolean } {
  if (adminUser.role !== "admin") throw Errors.forbidden();
  if (targetUserId === adminUser.id) throw Errors.badRequest("Kendinizi banlayamazsınız.");

  const target = database.select().from(users).where(eq(users.id, targetUserId)).get();
  if (!target) throw Errors.notFound("Kullanıcı");

  const newBanStatus = target.isBanned === 1 ? 0 : 1;
  database.update(users).set({ isBanned: newBanStatus }).where(eq(users.id, targetUserId)).run();

  return { isBanned: newBanStatus === 1 };
}
