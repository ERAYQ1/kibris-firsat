import { assertSameOrigin, handleApiError, jsonOk } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { deleteDeal, getDealDetail } from "@/server/deals";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, ctx: RouteContext) {
  try {
    const { id } = await ctx.params;
    const dealId = Number.parseInt(id, 10);
    const result = getDealDetail(dealId);
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request, ctx: RouteContext) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    const { id } = await ctx.params;
    await deleteDeal(Number.parseInt(id, 10), user);
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
