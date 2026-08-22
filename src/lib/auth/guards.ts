import "server-only";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Guards voor server components/pagina's: sturen door naar login of home in
 * plaats van te gooien. Autorisatie blijft server-side (zie docs/SECURITY.md §2).
 */
export async function requirePageUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  return user;
}

export async function requirePageRole(role: UserRole): Promise<User> {
  const user = await requirePageUser();
  if (user.role !== role) redirect("/");
  return user;
}
