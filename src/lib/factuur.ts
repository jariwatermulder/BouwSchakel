import { formatEuro } from "@/lib/utils";

/**
 * Gedeelde, pure factuurlogica (client + server): bedrag- en btw-berekening,
 * statusmeta en datum-/euro-opmaak. Eén bron van waarheid voor editor,
 * detailweergave en PDF.
 */

export type FactuurRegelBerekend = {
  omschrijving: string;
  aantal: number;
  eenheid: string | null;
  tariefCents: number;
  btwPercentage: number;
  bedragCents: number;
};

export type BtwGroep = {
  percentage: number;
  grondslagCents: number;
  btwCents: number;
};

export type FactuurTotalen = {
  subtotaalCents: number;
  btwGroepen: BtwGroep[];
  btwCents: number;
  totaalCents: number;
};

export function regelBedragCents(aantal: number, tariefCents: number): number {
  return Math.round((Number(aantal) || 0) * (Number(tariefCents) || 0));
}

/** Berekent subtotaal, btw per tarief en totaal. Rondt per btw-groep af. */
export function berekenTotalen(
  regels: { bedragCents: number; btwPercentage: number }[],
  btwVerlegd: boolean,
): FactuurTotalen {
  const subtotaalCents = regels.reduce((s, r) => s + r.bedragCents, 0);
  if (btwVerlegd) {
    return { subtotaalCents, btwGroepen: [], btwCents: 0, totaalCents: subtotaalCents };
  }
  const perTarief = new Map<number, number>();
  for (const r of regels) {
    perTarief.set(
      r.btwPercentage,
      (perTarief.get(r.btwPercentage) ?? 0) + r.bedragCents,
    );
  }
  const btwGroepen: BtwGroep[] = [...perTarief.entries()]
    .filter(([pct]) => pct > 0)
    .sort((a, b) => b[0] - a[0])
    .map(([percentage, grondslagCents]) => ({
      percentage,
      grondslagCents,
      btwCents: Math.round((grondslagCents * percentage) / 100),
    }));
  const btwCents = btwGroepen.reduce((s, g) => s + g.btwCents, 0);
  return { subtotaalCents, btwGroepen, btwCents, totaalCents: subtotaalCents + btwCents };
}

export const BTW_TARIEVEN = [21, 9, 0] as const;

export type FactuurStatus =
  | "CONCEPT"
  | "VERSTUURD"
  | "GEOPEND"
  | "BETAALD"
  | "TE_LAAT"
  | "GEANNULEERD";

export const STATUS_META: Record<
  string,
  { label: string; klasse: string; dot: string }
> = {
  CONCEPT: {
    label: "Concept",
    klasse: "bg-surface-muted text-foreground-muted border-border",
    dot: "#94a3b8",
  },
  VERSTUURD: {
    label: "Verzonden",
    klasse: "bg-navy-50 text-navy-700 border-navy-200",
    dot: "#2f5da6",
  },
  GEOPEND: {
    label: "Geopend",
    klasse: "border-violet-200 bg-violet-50 text-violet-700",
    dot: "#7c3aed",
  },
  BETAALD: {
    label: "Betaald",
    klasse: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "#16a34a",
  },
  TE_LAAT: {
    label: "Te laat",
    klasse: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "#d97706",
  },
  GEANNULEERD: {
    label: "Geannuleerd",
    klasse: "border-red-200 bg-red-50 text-red-700",
    dot: "#dc2626",
  },
};

/** Toont 'Te laat' voor onbetaalde, verzonden facturen waarvan de vervaldatum is verstreken. */
export function effectieveStatus(
  status: string,
  vervaldatum: Date | null,
): string {
  if (
    (status === "VERSTUURD" || status === "GEOPEND") &&
    vervaldatum &&
    vervaldatum.getTime() < Date.now()
  ) {
    return "TE_LAAT";
  }
  return status;
}

export function euro(cents: number): string {
  return formatEuro(cents);
}

export function datumNL(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "long" }).format(date);
}

export function datumKortNL(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("nl-NL", { dateStyle: "medium" }).format(date);
}
