import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { createReport } from "@/server/deals";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { reportSchema } from "@/lib/validation";
import { isReportReason } from "@/lib/report-reasons";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("report", user.id.toString());
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const body = reportSchema.parse(await readJson(req));
    if (!isReportReason(body.reason)) {
      throw new Error("Geçersiz rapor nedeni.");
    }
    createReport(dealId, user, body.reason, body.details || null);
    return jsonOk({ ok: true }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
