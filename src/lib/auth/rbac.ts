import type { AdminRole, User, UserRole } from "@prisma/client";

/**
 * Role-based access control helpers.
 *
 * Deze functies zijn puur en zonder side effects, zodat ze eenvoudig te testen
 * zijn (zie tests/rbac.test.ts). Autorisatie hoort altijd server-side te
 * gebeuren — een verborgen frontend-knop is geen beveiliging.
 * Zie docs/SECURITY.md §2.
 */

export class AuthorizationError extends Error {
  constructor(message = "Geen toegang") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message = "Niet ingelogd") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export function hasRole(user: User, role: UserRole): boolean {
  return user.role === role;
}

/** Rangorde van adminrollen; hoger = meer bevoegdheden. */
const ADMIN_RANK: Record<AdminRole, number> = {
  SUPPORT: 1,
  MODERATOR: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function isAdmin(user: User): boolean {
  return user.role === "ADMIN" && user.adminRole !== null;
}

/** True wanneer de gebruiker minimaal de gevraagde adminrol heeft. */
export function hasAdminAtLeast(user: User, minimum: AdminRole): boolean {
  if (!isAdmin(user) || user.adminRole === null) return false;
  return ADMIN_RANK[user.adminRole] >= ADMIN_RANK[minimum];
}

/** Eigenaarschapscontrole voor resources die aan een user hangen. */
export function ownsResource(user: User, resourceUserId: string): boolean {
  return user.id === resourceUserId;
}

// ── Guards (gooien bij falen; te gebruiken in server actions / route handlers) ─

export function requireUser(user: User | null): User {
  if (!user) throw new AuthenticationError();
  return user;
}

export function requireRole(user: User | null, role: UserRole): User {
  const u = requireUser(user);
  if (!hasRole(u, role)) throw new AuthorizationError();
  return u;
}

export function requireAdmin(user: User | null, minimum: AdminRole): User {
  const u = requireUser(user);
  if (!hasAdminAtLeast(u, minimum)) throw new AuthorizationError();
  return u;
}

export function requireOwnership(
  user: User | null,
  resourceUserId: string,
): User {
  const u = requireUser(user);
  // Admins met minimaal ADMIN mogen resources van anderen benaderen.
  if (ownsResource(u, resourceUserId) || hasAdminAtLeast(u, "ADMIN")) return u;
  throw new AuthorizationError();
}
