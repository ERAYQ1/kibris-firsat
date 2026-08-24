import { handleApiError, jsonOk } from "@/lib/http";
import { getSessionUser } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";

export async function GET(req: Request) {
  try {
    const token = getSessionTokenFromHeader(req);
    const user = getSessionUser(token);
    return jsonOk({ user });
  } catch (err) {
    return handleApiError(err);
  }
}
