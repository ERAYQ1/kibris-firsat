import { cookies } from "next/headers";
import { getSessionUser, type PublicUser } from "@/server/auth";
import { SESSION_COOKIE_NAME } from "@/lib/session-cookie";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  return getSessionUser(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}
