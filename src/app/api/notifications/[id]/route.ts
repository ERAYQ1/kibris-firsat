import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { markAsRead } from "@/server/notifications";
import { getDb } from "@/server/db";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    const { id } = await ctx.params;
    const notifId = Number.parseInt(id, 10);
    markAsRead(notifId, user.id, getDb());
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
