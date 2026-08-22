import { requirePageRole } from "@/lib/auth/guards";
import { AppShell, type AppNavItem } from "@/components/layout/app-shell";

const navItems: AppNavItem[] = [
  { href: "/bedrijven/dashboard", label: "Dashboard" },
  { href: "/bedrijven/opdracht-plaatsen", label: "Opdracht plaatsen" },
  { href: "/bedrijven/opdrachten", label: "Opdrachten" },
  { href: "/bedrijven/kandidaten", label: "Kandidaten" },
  { href: "/bedrijven/registreren", label: "Bedrijfsprofiel" },
  { href: "/bedrijven/instellingen", label: "Instellingen" },
];

export default async function BedrijfAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageRole("COMPANY");
  return (
    <AppShell navItems={navItems} email={user.email}>
      {children}
    </AppShell>
  );
}
