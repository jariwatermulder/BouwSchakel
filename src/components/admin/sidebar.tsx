"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/home/pictos";

export interface SidebarItem {
  href: string;
  label: string;
  icon?: string;
  /** Exact pad-match (voor /admin zelf). */
  exact?: boolean;
}

export interface SidebarGroep {
  titel: string;
  items: SidebarItem[];
}

const PERIODE_KEYS = ["p", "van", "tot"];

/**
 * Sidebar van de admin-omgeving. Op mobiel ingeklapt achter een menuknop.
 * De globale periodefilter (?p=…) reist mee naar analytics-pagina's.
 */
export function AdminSidebar({ groepen }: { groepen: SidebarGroep[] }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  // Menu sluit vanzelf bij navigatie: het staat alleen open voor het pad
  // waarop het geopend is.
  const [openVoor, setOpenVoor] = useState<string | null>(null);
  const open = openVoor === pathname;

  const periodeQuery = PERIODE_KEYS.filter((k) => sp.get(k))
    .map((k) => `${k}=${encodeURIComponent(sp.get(k)!)}`)
    .join("&");

  const hrefMet = (item: SidebarItem) =>
    periodeQuery && (item.href === "/admin" || item.href.startsWith("/admin/analytics"))
      ? `${item.href}?${periodeQuery}`
      : item.href;

  const actief = (item: SidebarItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const nav = (
    <nav aria-label="Beheermenu" className="flex flex-col gap-6">
      {groepen.map((g) => (
        <div key={g.titel}>
          <p className="text-foreground-muted px-3 text-[11px] font-semibold tracking-wider uppercase">
            {g.titel}
          </p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((item) => {
              const isActief = actief(item);
              return (
                <li key={item.href}>
                  <Link
                    href={hrefMet(item)}
                    aria-current={isActief ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActief
                        ? "bg-brand-50 text-brand-700"
                        : "text-foreground-muted hover:bg-surface-muted hover:text-foreground"
                    }`}
                  >
                    {item.icon ? (
                      <Icon name={item.icon} className={`h-4 w-4 shrink-0 ${isActief ? "text-brand-600" : "text-foreground-muted"}`} />
                    ) : null}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobiel: knop + uitklapbaar paneel */}
      <div className="border-border bg-surface flex items-center justify-between border-b px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setOpenVoor(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="admin-sidebar-mobiel"
          className="border-border text-foreground inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold"
        >
          <span aria-hidden className="flex flex-col gap-[3px]">
            <span className="bg-foreground block h-0.5 w-4 rounded" />
            <span className="bg-foreground block h-0.5 w-4 rounded" />
            <span className="bg-foreground block h-0.5 w-4 rounded" />
          </span>
          Menu
        </button>
        <span className="text-foreground-muted text-sm">
          {groepen.flatMap((g) => g.items).find(actief)?.label ?? "Beheer"}
        </span>
      </div>
      {open ? (
        <div id="admin-sidebar-mobiel" className="border-border bg-surface border-b p-4 lg:hidden">
          {nav}
        </div>
      ) : null}

      {/* Desktop: vaste kolom */}
      <aside className="border-border bg-surface hidden w-60 shrink-0 border-r p-4 lg:block">
        <div className="sticky top-4">{nav}</div>
      </aside>
    </>
  );
}
