/**
 * Eenvoudige in-memory rate limiter (fixed window) voor de MVP.
 *
 * Geschikt voor één server-instance. De interface is bewust minimaal zodat een
 * gedeelde store (bijv. Redis/Upstash) later kan worden ingeplugd zonder de
 * aanroepende code te wijzigen. Zie docs/SECURITY.md §5.
 */
export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface Counter {
  count: number;
  resetAt: number;
}

const store = new Map<string, Counter>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Alleen voor tests: leegt de interne teller. */
export function __resetRateLimitStore(): void {
  store.clear();
}
