import fs from "node:fs/promises";
import path from "node:path";
import { isSafeStoredFilename, resolveUploadDir } from "@/server/images";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!isSafeStoredFilename(file)) {
    return new Response("Not found", { status: 404 });
  }
  const uploadDir = resolveUploadDir();
  const target = path.join(uploadDir, file);
  if (path.dirname(target) !== uploadDir) {
    return new Response("Not found", { status: 404 });
  }

  let data: Buffer;
  try {
    data = await fs.readFile(target);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(file);
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
