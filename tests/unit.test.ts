import { describe, expect, it, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimits } from "@/lib/rate-limit";
import { enforceRateLimit } from "@/server/rate-guard";
import { parsePriceToCents, registerSchema } from "@/lib/validation";
import { formatPrice } from "@/lib/format";
import { isDealActive } from "@/server/deals";

describe("rate limiting", () => {
  beforeEach(() => resetRateLimits());

  it("limit dolmadan izin verir, dolduktan sonra reddeder", () => {
    const key = "test-key";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, 3, 60_000).allowed).toBe(true);
    }
    const blocked = checkRateLimit(key, 3, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("farklı keyler bağımsızdır", () => {
    checkRateLimit("k1", 1, 60_000);
    expect(checkRateLimit("k2", 1, 60_000).allowed).toBe(true);
  });

  it("eski istekler pencere dışında kalınca tekrar izin verilir", () => {
    const start = Date.now();
    checkRateLimit("win", 1, 1000, start);
    const blocked = checkRateLimit("win", 1, 1000, start + 500);
    expect(blocked.allowed).toBe(false);
    const allowed = checkRateLimit("win", 1, 1000, start + 1500);
    expect(allowed.allowed).toBe(true);
  });

  it("enforceRateLimit AppError fırlatır", () => {
    resetRateLimits();
    expect(() => {
      for (let i = 0; i < 15; i++) enforceRateLimit("login", "ip-x");
    }).toThrow(/Çok fazla/);
  });
});

describe("price parsing", () => {
  it.each([
    ["249.90", 24990],
    ["249,90", 24990],
    ["100", 10000],
    ["0.01", 1],
    ["99999999.99", 9999999999],
  ])("%s → %s kuruş", (input, expected) => {
    expect(parsePriceToCents(input)).toBe(expected);
  });

  it("registerSchema e-postayı normalize eder", () => {
    const parsed = registerSchema.parse({
      email: "  Eray@Test.LOCAL ",
      password: "Parola123456",
      displayName: "Eray",
    });
    expect(parsed.email).toBe("eray@test.local");
  });
});

describe("formatPrice", () => {
  it("fiyatı currency sembolüyle gösterir", () => {
    expect(formatPrice(24990, "TRY")).toContain("249,90");
    expect(formatPrice(24990, "TRY")).toContain("₺");
  });
});

describe("isDealActive", () => {
  const now = 1_000_000;

  it("aktif ve süresi geçmemiş → true", () => {
    expect(isDealActive({ status: "active", expiresAt: now + 10 }, now)).toBe(true);
  });

  it("expiresAt null ve aktif → true", () => {
    expect(isDealActive({ status: "active", expiresAt: null }, now)).toBe(true);
  });

  it("süresi dolmuş → false", () => {
    expect(isDealActive({ status: "active", expiresAt: now - 1 }, now)).toBe(false);
  });

  it.each(["removed", "reported", "expired"] as const)("status=%s → false", (status) => {
    expect(isDealActive({ status, expiresAt: now + 100 }, now)).toBe(false);
  });
});
