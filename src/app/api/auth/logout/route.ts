import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError } from "@/lib/http";
import { destroySession } from "@/server/auth";
import { clearSessionCookie, getSessionTokenFromHeader } from "@/lib/session-cookie";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const token = getSessionTokenFromHeader(req);
    destroySession(token);
    const res = NextResponse.json({ ok: true });
    clearSessionCookie(res);
    return res;
  } catch (err) {
    return handleApiError(err);
  }
}
