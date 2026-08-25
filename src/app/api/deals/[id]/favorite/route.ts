import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { toggleFavorite, isFavorited, getFavoriteCount } from "@/server/favorites";
import { getDb } from "@/server/db";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const db = getDb();
    const favorited = isFavorited(dealId, user.id, db);
    const count = getFavoriteCount(dealId, db);
    return jsonOk({ favorited, count });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("favorite", user.id.toString());

    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const result = toggleFavorite(dealId, user.id, getDb());

    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
