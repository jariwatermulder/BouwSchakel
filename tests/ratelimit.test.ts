import { beforeEach, describe, expect, it } from "vitest";
import { __resetRateLimitStore, rateLimit } from "@/lib/ratelimit";

describe("rate limiter", () => {
  beforeEach(() => __resetRateLimitStore());

  it("staat toe tot aan de limiet en blokkeert daarna", () => {
    const key = "test";
    expect(rateLimit(key, 3, 1000).success).toBe(true);
    expect(rateLimit(key, 3, 1000).success).toBe(true);
    expect(rateLimit(key, 3, 1000).success).toBe(true);
    const blocked = rateLimit(key, 3, 1000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("telt per sleutel apart", () => {
    expect(rateLimit("a", 1, 1000).success).toBe(true);
    expect(rateLimit("a", 1, 1000).success).toBe(false);
    expect(rateLimit("b", 1, 1000).success).toBe(true);
  });
});
