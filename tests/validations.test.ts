import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

describe("auth validaties", () => {
  it("accepteert geldige registratie en normaliseert e-mail", () => {
    const result = registerSchema.safeParse({
      email: "  Test@Example.COM ",
      password: " minstens-tien",
      role: "ZZP",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("test@example.com");
  });

  it("weigert een te kort wachtwoord", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "kort",
      role: "ZZP",
    });
    expect(result.success).toBe(false);
  });

  it("weigert een ongeldige rol", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: " minstens-tien",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });

  it("login vereist een niet-leeg wachtwoord", () => {
    expect(
      loginSchema.safeParse({ email: "test@example.com", password: "" })
        .success,
    ).toBe(false);
  });
});
