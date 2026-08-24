import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const SIGNATURES: Array<{ mime: string; ext: string; test: (b: Buffer) => boolean }> = [
  { mime: "image/jpeg", ext: ".jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: ".png",
    test: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47,
  },
  {
    mime: "image/webp",
    ext: ".webp",
    test: (b) =>
      b.subarray(0, 4).toString("ascii") === "RIFF" &&
      b.subarray(8, 12).toString("ascii") === "WEBP",
  },
];

export interface ImageDetectResult {
  mime: string;
  ext: string;
}

export function detectImageType(bytes: Buffer): ImageDetectResult | null {
  if (bytes.length < 12) return null;
  const match = SIGNATURES.find((s) => s.test(bytes));
  return match ? { mime: match.mime, ext: match.ext } : null;
}

export function resolveUploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR ?? "./data/uploads");
}

export async function saveImage(
  file: File,
  uploadDir: string = resolveUploadDir()
): Promise<{ filename: string; size: number }> {
  if (!(file instanceof File)) {
    throw new Error("Geçersiz dosya.");
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Dosya boyutu 0 byte ile 5 MB arasında olmalı.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) {
    throw new Error("Desteklenmeyen dosya türü. Sadece JPEG, PNG ve WebP yüklenebilir.");
  }

  await fs.mkdir(uploadDir, { recursive: true });
  const filename = `${randomUUID()}${detected.ext}`;
  const target = path.join(uploadDir, filename);
  const resolvedUploadDir = path.resolve(uploadDir);
  if (!path.resolve(target).startsWith(resolvedUploadDir + path.sep)) {
    throw new Error("Geçersiz dosya yolu.");
  }
  await fs.writeFile(target, bytes, { mode: 0o644 });
  return { filename, size: file.size };
}

const FILENAME_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

export function isSafeStoredFilename(name: string): boolean {
  return FILENAME_PATTERN.test(name);
}
