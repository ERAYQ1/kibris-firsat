import { describe, expect, it } from "vitest";
import { detectImageType, isSafeStoredFilename, MAX_IMAGE_BYTES } from "@/server/images";

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
const JPEG_MAGIC = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.alloc(8),
]);
const WEBP_MAGIC = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.alloc(4),
  Buffer.from("WEBP"),
]);

describe("detectImageType", () => {
  it("PNG imzasını tanır", () => {
    expect(detectImageType(PNG_MAGIC)).toEqual({ mime: "image/png", ext: ".png" });
  });

  it("JPEG imzasını tanır", () => {
    expect(detectImageType(JPEG_MAGIC)).toMatchObject({ mime: "image/jpeg" });
  });

  it("WebP imzasını tanır", () => {
    expect(detectImageType(WEBP_MAGIC)).toEqual({ mime: "image/webp", ext: ".webp" });
  });

  it.each([
    [Buffer.from("<script>alert(1)</script>xxxx"), "script içeriği"],
    [Buffer.from("<?php echo 1; ?>xxxxxxxxx"), "php dosyası"],
    [Buffer.from("GIF89a" + "x".repeat(6)), "gif (desteklenmiyor)"],
    [Buffer.alloc(4), "çok küçük buffer"],
  ]) ("executable/sahte içerik reddedilir: %s", (buf) => {
    expect(detectImageType(buf)).toBeNull();
  });
});

describe("isSafeStoredFilename", () => {
  it("geçerli UUID dosya adını kabul eder", () => {
    expect(
      isSafeStoredFilename("550e8400-e29b-41d4-a716-446655440000.png")
    ).toBe(true);
  });

  it.each([
    ["../../etc/passwd"],
    ["foo/../../bar.png"],
    ["test.php"],
    ["test.jpg.php"],
    ["../../.env"],
    ["png"],
    ["a".repeat(40) + ".exe"],
    [""],
    [".hidden.png"],
  ])("path traversal ve zararlı isimleri reddeder: %s", (name) => {
    expect(isSafeStoredFilename(name)).toBe(false);
  });
});

describe("MAX_IMAGE_BYTES", () => {
  it("5 MB sınırı tanımlı", () => {
    expect(MAX_IMAGE_BYTES).toBe(5 * 1024 * 1024);
  });
});
