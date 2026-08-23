import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button";

const navItems = [
  { href: "/opdrachten", label: "Opdrachten" },
  { href: "/hoe-het-werkt", label: "Hoe het werkt" },
  { href: "/zzpers", label: "Voor ZZP'ers" },
  { href: "/bedrijven", label: "Voor bedrijven" },
  { href: "/tarieven", label: "Tarieven" },
];

export function SiteHeader() {
  return (
    <header className="border-border bg-surface border-b">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="text-navy-900 flex items-center gap-2 font-bold"
        >
          <span
            aria-hidden
            className="bg-navy-800 text-accent-500 flex h-8 w-8 items-center justify-center rounded-md text-sm font-black"
          >
            BS
          </span>
          <span className="text-lg">BouwSchakel</span>
        </Link>

        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground-muted hover:text-navy-800 text-sm font-medium"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/inloggen" variant="ghost" size="sm">
            Inloggen
          </ButtonLink>
          <ButtonLink
            href="/bedrijven/opdracht-plaatsen"
            variant="accent"
            size="sm"
          >
            Opdracht plaatsen
          </ButtonLink>
        </div>
      </Container>
    </header>
  );
}
