import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AccountMenu } from "@/components/layout/account-menu";

export interface AppNavItem {
  href: string;
  label: string;
  badge?: number;
}

export interface AppPrimaryAction {
  href: string;
  label: string;
}

function Badge({ count }: { count?: number }) {
  if (!count || count <= 0) return null;
  return (
    <span className="bg-accent-500 text-ink ml-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function AppShell({
  navItems,
  menuItems = [],
  primaryAction,
  email,
  children,
}: {
  navItems: AppNavItem[];
  menuItems?: AppNavItem[];
  primaryAction?: AppPrimaryAction;
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border bg-ink border-b text-white">
        <Container className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-bold"
          >
            <span
              aria-hidden
              className="bg-navy-700 text-accent-500 flex h-8 w-8 items-center justify-center rounded-md text-sm font-black"
            >
              BS
            </span>
            <span className="hidden sm:inline">BouwSchakel</span>
          </Link>

          {/* Hoofdmenu (desktop) */}
          <nav
            aria-label="Hoofdmenu"
            className="ml-2 hidden flex-1 items-center gap-1 md:flex"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-navy-100 hover:bg-navy-700 rounded-md px-3 py-2 text-sm font-medium hover:text-white"
              >
                {item.label}
                <Badge count={item.badge} />
              </Link>
            ))}
          </nav>

          {/* Rechts: primaire actie + accountmenu */}
          <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="bg-accent-500 text-ink hover:bg-accent-400 hidden items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold sm:inline-flex"
              >
                <span aria-hidden>+</span> {primaryAction.label}
              </Link>
            ) : null}
            <AccountMenu email={email} items={menuItems} />
          </div>
        </Container>
      </header>

      {/* Mobiele nav: primaire items + primaire actie in een scrollstrip */}
      <nav
        aria-label="Hoofdmenu"
        className="border-border bg-surface flex gap-2 overflow-x-auto border-b px-4 py-2 md:hidden"
      >
        {primaryAction ? (
          <Link
            href={primaryAction.href}
            className="bg-accent-500 text-ink shrink-0 rounded-md px-3 py-1 text-sm font-semibold"
          >
            + {primaryAction.label}
          </Link>
        ) : null}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-foreground-muted shrink-0 rounded-md px-1 py-1 text-sm font-medium"
          >
            {item.label}
            <Badge count={item.badge} />
          </Link>
        ))}
      </nav>

      <main className="bg-surface-muted flex-1">{children}</main>
    </div>
  );
}
