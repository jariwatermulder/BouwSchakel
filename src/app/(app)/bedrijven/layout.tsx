import { requirePageRole } from "@/lib/auth/guards";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";
import { unreadMessagesCount } from "@/server/messaging/service";
import { unreadCount } from "@/server/notifications/service";

export default async function BedrijfAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("COMPANY");
  const [berichten, meldingen] = await Promise.all([
    unreadMessagesCount(user.id),
    unreadCount(user.id),
  ]);

  const navItems: AppNavItem[] = [
    { href: "/bedrijven/dashboard", label: "Dashboard" },
    { href: "/bedrijven/berichten", label: "Berichten", badge: berichten },
    { href: "/bedrijven/meldingen", label: "Meldingen", badge: meldingen },
  ];

  const menuItems: AppNavItem[] = [
    { href: "/bedrijven/registreren", label: "Bedrijfsprofiel" },
    { href: "/bedrijven/instellingen", label: "Instellingen" },
  ];

  return (
    <AppShell
      navItems={navItems}
      menuItems={menuItems}
      primaryAction={{ href: "/vind-zzper", label: "Vind een zzp'er" }}
      email={user.email}
    >
      {children}
    </AppShell>
  );
}
