import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import {
  listNotifications,
  getUnreadNotificationCount,
  markAllAsRead,
} from "@/server/notifications";
import { getDb } from "@/server/db";

export async function GET(req: Request) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const db = getDb();
    const items = listNotifications(user.id, db);
    const unreadCount = getUnreadNotificationCount(user.id, db);
    return jsonOk({ items, unreadCount });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    markAllAsRead(user.id, getDb());
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
