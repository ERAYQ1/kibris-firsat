import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { setVote } from "@/server/deals";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { voteSchema } from "@/lib/validation";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("vote", user.id.toString());
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const body = voteSchema.parse(await readJson(req));
    const counts = await setVote(dealId, user.id, body.value);
    return jsonOk(counts);
  } catch (err) {
    return handleApiError(err);
  }
}
