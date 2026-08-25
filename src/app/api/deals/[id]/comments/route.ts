import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { listComments, createComment } from "@/server/comments";
import { getDb } from "@/server/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const comments = listComments(dealId, getDb());
    return jsonOk({ comments });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("commentCreate", user.id.toString());

    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const body = await readJson(req);
    const comment = createComment(dealId, body, user, getDb());

    return jsonOk({ comment }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
