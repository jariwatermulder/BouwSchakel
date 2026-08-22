import { requirePageRole } from "@/lib/auth/guards";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";

const navItems: AppNavItem[] = [
  { href: "/zzpers/dashboard", label: "Dashboard" },
  { href: "/zzpers/opdrachten", label: "Opdrachten" },
  { href: "/zzpers/profiel", label: "Profiel" },
  { href: "/zzpers/beschikbaarheid", label: "Beschikbaarheid" },
  { href: "/zzpers/documenten", label: "Documenten" },
  { href: "/zzpers/instellingen", label: "Instellingen" },
];

export default async function ZzpAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("ZZP");
  return (
    <AppShell navItems={navItems} email={user.email}>
      {children}
    </AppShell>
  );
}
