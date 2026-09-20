import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { AdminSidebar, type SidebarGroep } from "@/components/admin/sidebar";

export const ADMIN_GROEPEN: SidebarGroep[] = [
  {
    titel: "Analytics",
    items: [
      { href: "/admin", label: "Dashboard", icon: "grid", exact: true },
      { href: "/admin/analytics/website", label: "Website analytics", icon: "match" },
      { href: "/admin/analytics/zzpers", label: "ZZP'ers", icon: "hammer" },
      { href: "/admin/analytics/bedrijven", label: "Bedrijven", icon: "users" },
      { href: "/admin/analytics/contact", label: "Matches & contact", icon: "chat" },
      { href: "/admin/analytics/zoekgedrag", label: "Zoekgedrag", icon: "search" },
      { href: "/admin/analytics/conversie", label: "Conversie", icon: "bolt" },
      { href: "/admin/analytics/activiteit", label: "Activiteit", icon: "clock" },
      { href: "/admin/instellingen", label: "Instellingen", icon: "doc" },
    ],
  },
  {
    titel: "Beheer",
    items: [
      { href: "/admin/gebruikers", label: "Gebruikers", icon: "person" },
      { href: "/admin/bedrijven", label: "Bedrijven (beheer)", icon: "users" },
      { href: "/admin/verificaties", label: "Verificaties", icon: "shield" },
      { href: "/admin/reports", label: "Reports", icon: "doc" },
      { href: "/admin/klachten", label: "Klachten", icon: "doc" },
      { href: "/admin/contact", label: "Contactberichten", icon: "chat" },
      { href: "/admin/catalogus", label: "Catalogus", icon: "wrench" },
      { href: "/admin/audit", label: "Audit", icon: "clock" },
    ],
  },
];

/** Kader van de admin-omgeving: donkere bovenbalk, sidebar links, inhoud rechts. */
export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="bg-ink text-white">
        <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-3" aria-label="ZZP Schakel beheer">
            <Logo className="w-[118px]" />
            <span className="border-navy-700 text-navy-200 hidden rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase sm:inline">
              Beheer
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/" className="text-navy-200 hidden text-sm hover:text-white sm:inline">
              Naar de website
            </Link>
            <AccountMenu email={email} items={[]} />
          </div>
        </div>
      </header>
      <div className="flex flex-1 flex-col lg:flex-row">
        <Suspense fallback={null}>
          <AdminSidebar groepen={ADMIN_GROEPEN} />
        </Suspense>
        <main className="bg-surface-muted min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
