"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ButtonLink, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(app)/actions";

type HeaderUser = { email: string; role: string } | null;

function dashboardPad(role: string): string {
  if (role === "COMPANY") return "/bedrijven/dashboard";
  if (role === "ADMIN") return "/admin";
  return "/zzpers/dashboard";
}

const navItems = [
  { href: "/opdrachten", label: "Opdrachten" },
  { href: "/zzpers", label: "Voor zzp'ers" },
  { href: "/bedrijven", label: "Voor opdrachtgevers" },
  { href: "/hoe-het-werkt", label: "Hoe het werkt" },
];

export function SiteHeader({ user }: { user?: HeaderUser }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "border-border sticky top-0 z-40 border-b transition-all duration-300 ease-out",
        scrolled
          ? "bg-surface/80 shadow-sm backdrop-blur-md"
          : "bg-surface",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-out",
          scrolled ? "h-14" : "h-16",
        )}
      >
        <Link
          href="/"
          className="text-navy-900 group flex items-center gap-2 font-bold"
        >
          <span
            aria-hidden
            className="bg-brand-500 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-black text-white transition-transform duration-200 ease-out group-hover:-translate-y-0.5 motion-reduce:transform-none"
          >
            ZC
          </span>
          <span className="text-lg">ZZP Connect</span>
        </Link>

        <nav
          aria-label="Hoofdmenu"
          className="hidden items-center gap-6 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground-muted hover:text-navy-800 after:bg-brand-500 relative text-sm font-medium transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:transition-all after:duration-300 hover:after:w-full motion-reduce:after:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink
                href={dashboardPad(user.role)}
                variant="ghost"
                size="sm"
              >
                Mijn account
              </ButtonLink>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Uitloggen
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink href="/inloggen" variant="ghost" size="sm">
                Inloggen
              </ButtonLink>
              <ButtonLink
                href="/bedrijven/opdracht-plaatsen"
                variant="brand"
                size="sm"
                className="rounded-xl"
              >
                Plaats een opdracht
              </ButtonLink>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
