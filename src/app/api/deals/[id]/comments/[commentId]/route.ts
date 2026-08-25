import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { deleteComment } from "@/server/comments";
import { getDb } from "@/server/db";

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("commentDelete", user.id.toString());

    const { commentId } = await ctx.params;
    const cId = Number.parseInt(commentId, 10);
    deleteComment(cId, user, getDb());

    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
