import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError, readJson, getClientIp } from "@/lib/http";
import { login, destroySession } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { setSessionCookie, getSessionTokenFromHeader } from "@/lib/session-cookie";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    enforceRateLimit("login", getClientIp(req));
    const body = await readJson(req);
    const { user, token } = await login(body);
    const res = NextResponse.json({ user });
    const oldToken = getSessionTokenFromHeader(req);
    if (oldToken) destroySession(oldToken);
    setSessionCookie(res, token);
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
