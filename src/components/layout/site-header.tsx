"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/brand/logo";
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
  { href: "/vind-zzper", label: "Vind een zzp'er" },
  { href: "/zzpers", label: "Voor zzp'ers" },
  { href: "/hoe-het-werkt", label: "Hoe het werkt" },
];

export function SiteHeader({ user }: { user?: HeaderUser }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sluit = () => setOpen(false);

  return (
    <header
      className={cn(
        "border-brand-700/40 sticky top-0 z-40 border-b text-white transition-all duration-300 ease-out",
        scrolled || open
          ? "bg-brand-600/95 shadow-sm backdrop-blur-md"
          : "bg-brand-500",
      )}
    >
      <Container
        className={cn(
          "flex items-center justify-between transition-all duration-300 ease-out",
          scrolled ? "h-14 md:h-[68px]" : "h-16 md:h-[76px]",
        )}
      >
        <Link
          href="/"
          className="flex items-center"
          aria-label="ZZP Schakel — naar de homepage"
          onClick={sluit}
        >
          <Logo
            priority
            className={cn(
              "transition-all duration-300 ease-out",
              scrolled ? "w-[126px] md:w-[148px]" : "w-[132px] md:w-[156px]",
            )}
          />
        </Link>

        <nav aria-label="Hoofdmenu" className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium whitespace-nowrap text-white/85 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-white after:transition-all after:duration-300 hover:after:w-full motion-reduce:after:transition-none"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Acties op desktop */}
        <div className="hidden items-center gap-2 whitespace-nowrap lg:flex">
          {user ? (
            <>
              <ButtonLink
                href={dashboardPad(user.role)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Mijn account
              </ButtonLink>
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
                >
                  Uitloggen
                </Button>
              </form>
            </>
          ) : (
            <>
              <ButtonLink
                href="/inloggen"
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Inloggen
              </ButtonLink>
              <ButtonLink
                href="/registreren?rol=zzp"
                variant="brand"
                size="sm"
                data-track="cta_clicked"
                data-track-label="header-maak-profiel"
                className="rounded-xl bg-white text-brand-700 hover:bg-white/90 hover:text-brand-700"
              >
                Maak een profiel
              </ButtonLink>
            </>
          )}
        </div>

        {/* Hamburger op mobiel */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobiel-menu"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-6 w-6">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      {/* Uitklapmenu op mobiel */}
      {open ? (
        <div id="mobiel-menu" className="border-t border-white/15 lg:hidden">
          <Container className="flex flex-col py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={sluit}
                className="rounded-lg px-2 py-3 text-base font-medium text-white/90 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-white/15 pt-3">
              {user ? (
                <>
                  <ButtonLink
                    href={dashboardPad(user.role)}
                    variant="brand"
                    size="lg"
                    onClick={sluit}
                    className="w-full justify-center rounded-xl bg-white text-brand-700 hover:bg-white/90 hover:text-brand-700"
                  >
                    Mijn account
                  </ButtonLink>
                  <form action={logoutAction}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="lg"
                      className="w-full justify-center border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
                    >
                      Uitloggen
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <ButtonLink
                    href="/registreren?rol=zzp"
                    variant="brand"
                    size="lg"
                    data-track="cta_clicked"
                    data-track-label="menu-maak-profiel"
                    onClick={sluit}
                    className="w-full justify-center rounded-xl bg-white text-brand-700 hover:bg-white/90 hover:text-brand-700"
                  >
                    Maak een profiel
                  </ButtonLink>
                  <ButtonLink
                    href="/inloggen"
                    variant="outline"
                    size="lg"
                    onClick={sluit}
                    className="w-full justify-center border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 hover:text-white"
                  >
                    Inloggen
                  </ButtonLink>
                </>
              )}
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
