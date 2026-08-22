import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("verifieert een correct wachtwoord", async () => {
    const hash = await hashPassword("geheim-wachtwoord");
    expect(await verifyPassword("geheim-wachtwoord", hash)).toBe(true);
  });

  it("weigert een onjuist wachtwoord", async () => {
    const hash = await hashPassword("geheim-wachtwoord");
    expect(await verifyPassword("verkeerd", hash)).toBe(false);
  });

  it("produceert per keer een andere hash (salt)", async () => {
    const a = await hashPassword("zelfde");
    const b = await hashPassword("zelfde");
    expect(a).not.toBe(b);
  });
});
