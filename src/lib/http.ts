import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";

export function jsonOk<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message } },
      { status: err.status }
    );
  }
  if (err instanceof ZodError) {
    const first = err.errors[0];
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: first?.message ?? "Geçersiz veri.",
        },
      },
      { status: 422 }
    );
  }
  console.error("[api] unexpected error:", err);
  return NextResponse.json(
    { error: { code: "internal", message: "Beklenmeyen bir hata oluştu." } },
    { status: 500 }
  );
}

export function assertSameOrigin(req: Request): void {
  const origin = req.headers.get("origin");
  if (!origin) return;
  const host = req.headers.get("host");
  let originHost: string | null = null;
  try {
    originHost = new URL(origin).host;
  } catch {
    originHost = null;
  }
  if (!host || !originHost || originHost !== host) {
    throw new AppError(403, "csrf_rejected", "Geçersiz istek kaynağı.");
  }
}

export async function readJson(req: Request): Promise<unknown> {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new AppError(415, "unsupported_media_type", "JSON bekleniyor.");
  }
  try {
    return await req.json();
  } catch {
    throw new AppError(400, "invalid_json", "Geçersiz JSON.");
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
