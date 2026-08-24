import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { createDeal, listDeals } from "@/server/deals";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sortParam = url.searchParams.get("sort");
    const result = await listDealsPublic({
      q: url.searchParams.get("q") ?? undefined,
      categorySlug: url.searchParams.get("category") ?? undefined,
      locationSlug: url.searchParams.get("location") ?? undefined,
      sort: sortParam === "top" ? "top" : "newest",
      page: Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1,
    });
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("dealCreate", user.id.toString());
    const body = await readJson(req);
    const created = await createDeal(body, user);
    return jsonOk(created, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
