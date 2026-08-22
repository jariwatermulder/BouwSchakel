import { describe, expect, it } from "vitest";
import type { AdminRole, User, UserRole } from "@prisma/client";
import {
  AuthenticationError,
  AuthorizationError,
  hasAdminAtLeast,
  ownsResource,
  requireAdmin,
  requireOwnership,
  requireRole,
  requireUser,
} from "@/lib/auth/rbac";

function makeUser(
  overrides: Partial<User> & { role: UserRole; adminRole?: AdminRole | null },
): User {
  return {
    id: "user-1",
    email: "test@example.com",
    passwordHash: "x",
    status: "ACTIEF",
    emailVerifiedAt: null,
    lastLoginAt: null,
    adminRole: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  } as User;
}

describe("rbac", () => {
  it("requireUser gooit bij ontbrekende gebruiker", () => {
    expect(() => requireUser(null)).toThrow(AuthenticationError);
  });

  it("requireRole staat juiste rol toe en weigert verkeerde", () => {
    const zzp = makeUser({ role: "ZZP" });
    expect(requireRole(zzp, "ZZP")).toBe(zzp);
    expect(() => requireRole(zzp, "COMPANY")).toThrow(AuthorizationError);
  });

  it("adminrangorde werkt cumulatief", () => {
    const moderator = makeUser({ role: "ADMIN", adminRole: "MODERATOR" });
    expect(hasAdminAtLeast(moderator, "SUPPORT")).toBe(true);
    expect(hasAdminAtLeast(moderator, "MODERATOR")).toBe(true);
    expect(hasAdminAtLeast(moderator, "ADMIN")).toBe(false);
  });

  it("een niet-admin is nooit admin", () => {
    const company = makeUser({ role: "COMPANY" });
    expect(hasAdminAtLeast(company, "SUPPORT")).toBe(false);
    expect(() => requireAdmin(company, "SUPPORT")).toThrow(AuthorizationError);
  });

  it("eigenaarschap: eigenaar mag, ander niet, admin wel", () => {
    const owner = makeUser({ id: "owner", role: "ZZP" });
    const other = makeUser({ id: "other", role: "ZZP" });
    const admin = makeUser({ id: "adm", role: "ADMIN", adminRole: "ADMIN" });

    expect(ownsResource(owner, "owner")).toBe(true);
    expect(requireOwnership(owner, "owner")).toBe(owner);
    expect(() => requireOwnership(other, "owner")).toThrow(AuthorizationError);
    expect(requireOwnership(admin, "owner")).toBe(admin);
  });
});
