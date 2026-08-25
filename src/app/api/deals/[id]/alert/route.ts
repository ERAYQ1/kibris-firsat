import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { setPriceAlert, getAlertForDeal, removePriceAlert } from "@/server/alerts";
import { priceAlertSchema, parsePriceToCents } from "@/lib/validation";
import { getDb } from "@/server/db";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const db = getDb();
    const alert = getAlertForDeal(user.id, dealId, db);
    return jsonOk({ hasAlert: Boolean(alert), alert });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("alert", user.id.toString());

    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const body = await req.json();
    const parsed = priceAlertSchema.parse(body);
    const targetPriceCents = parsePriceToCents(parsed.targetPrice);

    const alert = setPriceAlert(
      {
        userId: user.id,
        dealId,
        targetPriceCents,
      },
      getDb()
    );

    return jsonOk({ success: true, alert });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("alert", user.id.toString());

    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const removed = removePriceAlert(user.id, dealId, getDb());

    return jsonOk({ success: true, removed });
  } catch (err) {
    return handleApiError(err);
  }
}
