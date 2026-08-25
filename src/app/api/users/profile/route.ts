import { z } from "zod";
import { assertSameOrigin, handleApiError, jsonOk, readJson } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";
import { getUserProfile, updateUserProfile } from "@/server/users";
import { getDb } from "@/server/db";

const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(40).optional(),
    bio: z.string().trim().max(300).optional(),
    avatar: z.string().trim().max(120).optional(),
  })
  .strict();

export async function GET(req: Request) {
  try {
    const user = requireUser(getSessionTokenFromHeader(req));
    const profile = await getUserProfile(user.id, getDb());
    return jsonOk(profile);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("profileUpdate", user.id.toString());

    const body = profileUpdateSchema.parse(await readJson(req));
    updateUserProfile(user.id, body, getDb());
    const updated = await getUserProfile(user.id, getDb());

    return jsonOk(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
