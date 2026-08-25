import { handleApiError, jsonOk } from "@/lib/http";
import { requireAdmin } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { adminGetStats } from "@/server/users";
import { getDb } from "@/server/db";

export async function GET(req: Request) {
  try {
    const admin = requireAdmin(getSessionTokenFromHeader(req));
    const stats = adminGetStats(admin, getDb());
    return jsonOk(stats);
  } catch (err) {
    return handleApiError(err);
  }
}
