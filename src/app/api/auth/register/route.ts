import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError, readJson, getClientIp } from "@/lib/http";
import { register } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { setSessionCookie } from "@/lib/session-cookie";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    enforceRateLimit("register", getClientIp(req));
    const body = await readJson(req);
    const { user, token } = await register(body);
    const res = NextResponse.json({ user }, { status: 201 });
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
