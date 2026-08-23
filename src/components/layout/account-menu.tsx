"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/(app)/actions";
import type { AppNavItem } from "@/components/layout/app-shell";

/**
 * Accountmenu rechtsboven: bundelt e-mail, secundaire links (profiel,
 * instellingen, …) en uitloggen in één nette dropdown, zodat de bovenbalk
 * overzichtelijk blijft.
 */
export function AccountMenu({
  email,
  items,
}: {
  email: string;
  items: AppNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initiaal = email.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Accountmenu"
        className="hover:bg-navy-700 flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors"
      >
        <span className="bg-accent-500 text-ink flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
          {initiaal}
        </span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="text-navy-200 h-4 w-4"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="border-border bg-surface absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border shadow-lg"
        >
          <div className="border-border border-b px-4 py-3">
            <p className="text-foreground-muted text-xs">Ingelogd als</p>
            <p className="text-foreground truncate text-sm font-medium">
              {email}
            </p>
          </div>
          <div className="py-1">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-surface-muted block px-4 py-2 text-sm"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="border-border border-t py-1">
            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="text-foreground hover:bg-surface-muted block w-full px-4 py-2 text-left text-sm font-medium"
              >
                Uitloggen
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
