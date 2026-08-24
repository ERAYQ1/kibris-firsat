import { AppError } from "@/lib/errors";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export function enforceRateLimit(
  key: keyof typeof RATE_LIMITS,
  subject: string
): void {
  const { limit, windowMs } = RATE_LIMITS[key];
  const result = checkRateLimit(`${key}:${subject}`, limit, windowMs);
  if (!result.allowed) {
    throw new AppError(
      429,
      "rate_limited",
      "Çok fazla deneme yaptınız. Lütfen bir süre bekleyin."
    );
  }
}
