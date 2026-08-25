import { z } from "zod";
import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireAdmin } from "@/server/auth";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { adminListUsers, adminToggleBanUser } from "@/server/users";
import { getDb } from "@/server/db";

const banUserSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export async function GET(req: Request) {
  try {
    const admin = requireAdmin(getSessionTokenFromHeader(req));
    const users = adminListUsers(admin, getDb());
    return jsonOk({ users });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const admin = requireAdmin(getSessionTokenFromHeader(req));
    const body = banUserSchema.parse(await readJson(req));
    const result = adminToggleBanUser(body.userId, admin, getDb());
    return jsonOk(result);
  } catch (err) {
    return handleApiError(err);
  }
}
