import { desc, eq, and } from "drizzle-orm";
import { getDb, type Db } from "@/server/db";
import { notifications } from "@/db/schema";
import { Errors } from "@/lib/errors";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: number;
}

export function listNotifications(userId: number, database: Db = getDb()): NotificationItem[] {
  if (!Number.isInteger(userId) || userId <= 0) throw Errors.badRequest("Geçersiz kullanıcı.");

  const rows = database
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(30)
    .all();

  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    link: r.link,
    isRead: r.isRead === 1,
    createdAt: r.createdAt,
  }));
}

export function getUnreadNotificationCount(userId: number, database: Db = getDb()): number {
  if (!Number.isInteger(userId) || userId <= 0) return 0;
  const rows = database
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0)))
    .all();
  return rows.length;
}

export function createNotification(
  userId: number,
  title: string,
  message: string,
  link?: string,
  database: Db = getDb()
): void {
  database
    .insert(notifications)
    .values({
      userId,
      title,
      message,
      link: link || null,
      isRead: 0,
    })
    .run();
}

export function markAsRead(id: number, userId: number, database: Db = getDb()): void {
  database
    .update(notifications)
    .set({ isRead: 1 })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .run();
}

export function markAllAsRead(userId: number, database: Db = getDb()): void {
  database
    .update(notifications)
    .set({ isRead: 1 })
    .where(eq(notifications.userId, userId))
    .run();
}
