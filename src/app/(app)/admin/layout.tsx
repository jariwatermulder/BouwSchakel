import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdmin } from "@/lib/auth/rbac";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Beveiligde admin-omgeving. Autorisatie gebeurt hier server-side (rol ADMIN
 * met een adminRole); elke pagina en API-route controleert daarnaast zelf nog
 * eens via requireCurrentAdmin. Een verborgen link is geen beveiliging.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen?next=%2Fadmin");
  if (!isAdmin(user)) redirect("/");

  return <AdminShell email={user.email}>{children}</AdminShell>;
}
