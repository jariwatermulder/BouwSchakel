import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdmin } from "@/lib/auth/rbac";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";

const navItems: AppNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/gebruikers", label: "Gebruikers" },
  { href: "/admin/bedrijven", label: "Bedrijven" },
  { href: "/admin/verificaties", label: "Verificaties" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/klachten", label: "Klachten" },
  { href: "/admin/matching", label: "Matching" },
  { href: "/admin/prijzen", label: "Prijzen" },
  { href: "/admin/catalogus", label: "Catalogus" },
  { href: "/admin/audit", label: "Audit" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/inloggen");
  if (!isAdmin(user)) redirect("/");

  return (
    <AppShell navItems={navItems} email={user.email}>
      {children}
    </AppShell>
  );
}
