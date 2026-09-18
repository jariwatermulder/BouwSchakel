import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
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

/**
 * Zonder sessie sturen we netjes door naar inloggen (in plaats van een
 * foutpagina/stacktrace); rolproblemen blijven een AuthorizationError.
 */
async function currentOrLogin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  return user;
}

export async function requireCurrentUser(): Promise<User> {
  return requireUser(await currentOrLogin());
}

export async function requireCurrentRole(role: UserRole): Promise<User> {
  return requireRole(await currentOrLogin(), role);
}

export async function requireCurrentAdmin(minimum: AdminRole): Promise<User> {
  return requireAdmin(await currentOrLogin(), minimum);
}
