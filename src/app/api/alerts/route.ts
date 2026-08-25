import { handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { getUserAlerts } from "@/server/alerts";
import { getDb } from "@/server/db";

export async function GET(req: Request) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const alerts = getUserAlerts(user.id, getDb());
    return jsonOk({ alerts });
  } catch (err) {
    return handleApiError(err);
  }
}
