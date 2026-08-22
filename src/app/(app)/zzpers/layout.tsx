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
    { href: "/zzpers/opdrachten", label: "Opdrachten" },
    { href: "/zzpers/reacties", label: "Reacties" },
    { href: "/zzpers/mijn-opdrachten", label: "Mijn opdrachten" },
    { href: "/zzpers/berichten", label: "Berichten", badge: berichten },
    { href: "/zzpers/meldingen", label: "Meldingen", badge: meldingen },
    { href: "/zzpers/profiel", label: "Profiel" },
    { href: "/zzpers/beschikbaarheid", label: "Beschikbaarheid" },
    { href: "/zzpers/documenten", label: "Documenten" },
    { href: "/zzpers/instellingen", label: "Instellingen" },
  ];

  return (
    <AppShell navItems={navItems} email={user.email}>
      {children}
    </AppShell>
  );
}
