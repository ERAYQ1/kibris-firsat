import { z } from "zod";
import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { setDealVerification, getDealVerificationStats } from "@/server/verifications";
import { getDb } from "@/server/db";

const verifySchema = z
  .object({
    type: z.enum(["verified_active", "sold_out", "wrong_price"]),
  })
  .strict();

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const userToken = getSessionTokenFromHeader(req);
    let userId: number | undefined;
    try {
      if (userToken) {
        const user = requireUser(userToken);
        userId = user.id;
      }
    } catch {
      userId = undefined;
    }

    const stats = getDealVerificationStats(dealId, userId, getDb());
    return jsonOk(stats);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("verify", user.id.toString());

    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const body = verifySchema.parse(await readJson(req));
    const stats = setDealVerification(dealId, user.id, body.type, getDb());

    return jsonOk(stats);
  } catch (err) {
    return handleApiError(err);
  }
}
