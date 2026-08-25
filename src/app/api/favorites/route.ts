import { handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { listUserFavorites } from "@/server/favorites";
import { getDb } from "@/server/db";

export async function GET(req: Request) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const items = listUserFavorites(user.id, getDb());
    return jsonOk({ items });
  } catch (err) {
    return handleApiError(err);
  }
}
