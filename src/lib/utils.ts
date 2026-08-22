import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combineert Tailwind-classes en lost conflicten deterministisch op. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formatteert een bedrag in centen naar een NL euro-string. */
export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
