import { requirePageRole } from "@/lib/auth/guards";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";
import { unreadMessagesCount } from "@/server/messaging/service";
import { unreadCount } from "@/server/notifications/service";

export default async function ZzpAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("ZZP");
  const [berichten, meldingen] = await Promise.all([
    unreadMessagesCount(user.id),
    unreadCount(user.id),
  ]);

  const navItems: AppNavItem[] = [
    { href: "/zzpers/dashboard", label: "Dashboard" },
    { href: "/zzpers/berichten", label: "Berichten", badge: berichten },
    { href: "/zzpers/meldingen", label: "Meldingen", badge: meldingen },
  ];

  const menuItems: AppNavItem[] = [
    { href: "/zzpers/profiel", label: "Profiel" },
    { href: "/zzpers/beschikbaarheid", label: "Beschikbaarheid" },
    { href: "/zzpers/documenten", label: "Documenten" },
    { href: "/zzpers/facturen", label: "Facturen" },
    { href: "/zzpers/instellingen", label: "Instellingen" },
  ];

  return (
    <AppShell
      navItems={navItems}
      menuItems={menuItems}
      primaryAction={{ href: "/zzpers/profiel", label: "Mijn profiel" }}
      email={user.email}
    >
      {children}
    </AppShell>
  );
}
