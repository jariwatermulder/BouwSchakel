import Link from "next/link";
import { Container } from "@/components/ui/container";
import { logoutAction } from "@/app/(app)/actions";

export interface AppNavItem {
  href: string;
  label: string;
  badge?: number;
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
  email,
  children,
}: {
  navItems: AppNavItem[];
  email: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-border bg-ink border-b text-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span
                aria-hidden
                className="bg-navy-700 text-accent-500 flex h-8 w-8 items-center justify-center rounded-md text-sm font-black"
              >
                BS
              </span>
              BouwSchakel
            </Link>
            <nav aria-label="Menu" className="hidden gap-4 md:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-navy-100 text-sm font-medium hover:text-white"
                >
                  {item.label}
                  <Badge count={item.badge} />
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-navy-200 hidden text-sm sm:inline">
              {email}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-navy-100 text-sm font-medium hover:text-white"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </Container>
      </header>

      {/* Mobiele nav */}
      <nav
        aria-label="Menu"
        className="border-border bg-surface flex gap-4 overflow-x-auto border-b px-4 py-2 md:hidden"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-foreground-muted shrink-0 text-sm font-medium"
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
