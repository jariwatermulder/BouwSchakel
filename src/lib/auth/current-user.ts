import "server-only";
import { cache } from "react";
import type { User } from "@prisma/client";
import { getSessionUser } from "@/lib/auth/session";
import { requireAdmin, requireRole, requireUser } from "@/lib/auth/rbac";
import type { AdminRole, UserRole } from "@prisma/client";

/**
 * Haalt de huidige gebruiker op uit de sessie. `cache()` zorgt dat dit per
 * request maar één keer de database raakt, ook bij meerdere aanroepen binnen
 * dezelfde render.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  return getSessionUser();
});

export async function requireCurrentUser(): Promise<User> {
  return requireUser(await getCurrentUser());
}

export async function requireCurrentRole(role: UserRole): Promise<User> {
  return requireRole(await getCurrentUser(), role);
}

export async function requireCurrentAdmin(minimum: AdminRole): Promise<User> {
  return requireAdmin(await getCurrentUser(), minimum);
}
