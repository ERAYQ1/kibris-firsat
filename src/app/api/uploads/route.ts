import { NextResponse } from "next/server";
import { assertSameOrigin, handleApiError } from "@/lib/http";
import { requireUser } from "@/server/auth";
import { enforceRateLimit } from "@/server/rate-guard";
import { saveImage } from "@/server/images";
import { getSessionTokenFromHeader } from "@/lib/session-cookie";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    assertSameOrigin(req);
    const user = requireUser(getSessionTokenFromHeader(req));
    enforceRateLimit("upload", user.id.toString());

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      throw new Error("multipart/form-data bekleniyor.");
    }

    const form = await req.formData();
    const file = form.get("image");
    if (!(file instanceof File)) {
      throw new Error("Dosya bulunamadı.");
    }

    const saved = await saveImage(file);
    return NextResponse.json(
      { url: `/api/images/${saved.filename}`, filename: saved.filename },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
