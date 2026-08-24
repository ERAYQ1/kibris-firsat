type Window = { hits: number[] };

const windows = new Map<string, Window>();
let lastPrune = Date.now();

function prune(now: number, windowMs: number) {
  if (now - lastPrune < windowMs / 2) return;
  lastPrune = now;
  for (const [key, w] of windows) {
    if (w.hits.length === 0 || now - w.hits[w.hits.length - 1] > windowMs * 5) {
      windows.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  prune(now, windowMs);
  const w = windows.get(key) ?? { hits: [] };
  w.hits = w.hits.filter((t) => now - t < windowMs);

  if (w.hits.length >= limit) {
    windows.set(key, w);
    const oldest = w.hits[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  w.hits.push(now);
  windows.set(key, w);
  return { allowed: true, remaining: limit - w.hits.length, retryAfterSeconds: 0 };
}

export function resetRateLimits(): void {
  windows.clear();
}

export const RATE_LIMITS = {
  register: { limit: 10, windowMs: 15 * 60_000 },
  login: { limit: 10, windowMs: 15 * 60_000 },
  dealCreate: { limit: 20, windowMs: 60 * 60_000 },
  vote: { limit: 120, windowMs: 60 * 60_000 },
  report: { limit: 30, windowMs: 60 * 60_000 },
  upload: { limit: 40, windowMs: 60 * 60_000 },
} as const;
