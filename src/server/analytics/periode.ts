/**
 * Globale periodefilter van het admin-dashboard. Alle grenzen worden in
 * Europe/Amsterdam berekend; de database bewaart UTC.
 */
export const TZ = "Europe/Amsterdam";

export const PERIODES = [
  { key: "vandaag", label: "Vandaag" },
  { key: "gisteren", label: "Gisteren" },
  { key: "7d", label: "7 dagen" },
  { key: "30d", label: "30 dagen" },
  { key: "90d", label: "90 dagen" },
  { key: "12m", label: "12 maanden" },
  { key: "jaar", label: "Dit jaar" },
  { key: "custom", label: "Aangepast" },
] as const;

export type PeriodeKey = (typeof PERIODES)[number]["key"];
export type Bucket = "hour" | "day" | "week" | "month";

export interface Periode {
  key: PeriodeKey;
  label: string;
  /** Inclusief. */
  van: Date;
  /** Exclusief. */
  tot: Date;
  /** Even lange periode ervoor, voor de vergelijking. */
  vorigeVan: Date;
  vorigeTot: Date;
  bucket: Bucket;
  /** Voor de URL (?p=… of ?van=…&tot=…). */
  query: string;
}

function tzOffsetMs(d: Date): number {
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  return d.getTime() - local.getTime();
}

/** Middernacht (Amsterdam) van de dag waarin `d` valt, als UTC-instant. */
export function startVanDag(d: Date): Date {
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  local.setHours(0, 0, 0, 0);
  return new Date(local.getTime() + tzOffsetMs(d));
}

export function plusDagen(d: Date, n: number): Date {
  // Via lokale datum, zodat zomer-/wintertijd geen uur verschuift.
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  local.setDate(local.getDate() + n);
  local.setHours(0, 0, 0, 0);
  return new Date(local.getTime() + tzOffsetMs(local));
}

function startVanJaar(d: Date): Date {
  const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
  local.setMonth(0, 1);
  local.setHours(0, 0, 0, 0);
  return new Date(local.getTime() + tzOffsetMs(d));
}

function parseDatum(s: string | undefined): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : startVanDag(d);
}

function kiesBucket(van: Date, tot: Date): Bucket {
  const dagen = (tot.getTime() - van.getTime()) / 86_400_000;
  if (dagen <= 1.01) return "hour";
  if (dagen <= 92) return "day";
  if (dagen <= 400) return "week";
  return "month";
}

export function parsePeriode(sp: { p?: string; van?: string; tot?: string }): Periode {
  const nu = new Date();
  const vandaag = startVanDag(nu);
  const morgen = plusDagen(vandaag, 1);
  const key = (PERIODES.some((x) => x.key === sp.p) ? sp.p : "30d") as PeriodeKey;

  let van: Date;
  let tot: Date;
  let query = `p=${key}`;
  switch (key) {
    case "vandaag":
      van = vandaag;
      tot = morgen;
      break;
    case "gisteren":
      van = plusDagen(vandaag, -1);
      tot = vandaag;
      break;
    case "7d":
      van = plusDagen(vandaag, -6);
      tot = morgen;
      break;
    case "90d":
      van = plusDagen(vandaag, -89);
      tot = morgen;
      break;
    case "12m":
      van = plusDagen(vandaag, -364);
      tot = morgen;
      break;
    case "jaar":
      van = startVanJaar(nu);
      tot = morgen;
      break;
    case "custom": {
      const v = parseDatum(sp.van);
      const t = parseDatum(sp.tot);
      if (v && t && t >= v) {
        van = v;
        tot = plusDagen(t, 1);
        query = `p=custom&van=${sp.van}&tot=${sp.tot}`;
        break;
      }
      van = plusDagen(vandaag, -29);
      tot = morgen;
      query = "p=30d";
      break;
    }
    case "30d":
    default:
      van = plusDagen(vandaag, -29);
      tot = morgen;
      break;
  }

  const lengte = tot.getTime() - van.getTime();
  const label =
    key === "custom"
      ? `${formatDatum(van)} – ${formatDatum(plusDagen(tot, -1))}`
      : PERIODES.find((x) => x.key === key)!.label;

  return {
    key,
    label,
    van,
    tot,
    vorigeVan: new Date(van.getTime() - lengte),
    vorigeTot: van,
    bucket: kiesBucket(van, tot),
    query,
  };
}

export function formatDatum(d: Date): string {
  return d.toLocaleDateString("nl-NL", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
}

/** Alle bucketlabels tussen van en tot (lokale tijd), voor gap-filling van reeksen. */
export function bucketLabels(van: Date, tot: Date, bucket: Bucket): string[] {
  const labels: string[] = [];
  let d = new Date(van);
  const stap = (x: Date): Date => {
    const local = new Date(x.toLocaleString("en-US", { timeZone: TZ }));
    if (bucket === "hour") local.setHours(local.getHours() + 1);
    else if (bucket === "day") local.setDate(local.getDate() + 1);
    else if (bucket === "week") local.setDate(local.getDate() + 7);
    else local.setMonth(local.getMonth() + 1);
    return new Date(local.getTime() + tzOffsetMs(local));
  };
  // Weken beginnen op maandag (zoals date_trunc('week')).
  if (bucket === "week") {
    const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
    const dag = (local.getDay() + 6) % 7;
    local.setDate(local.getDate() - dag);
    local.setHours(0, 0, 0, 0);
    d = new Date(local.getTime() + tzOffsetMs(local));
  }
  if (bucket === "month") {
    const local = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
    local.setDate(1);
    local.setHours(0, 0, 0, 0);
    d = new Date(local.getTime() + tzOffsetMs(local));
  }
  let i = 0;
  while (d < tot && i < 800) {
    labels.push(bucketLabel(d, bucket));
    d = stap(d);
    i += 1;
  }
  return labels;
}

/** Zelfde vorm als de database-bucket: "YYYY-MM-DD" of "YYYY-MM-DDTHH:00". */
export function bucketLabel(d: Date, bucket: Bucket): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  const datum = `${get("year")}-${get("month")}-${get("day")}`;
  return bucket === "hour" ? `${datum}T${get("hour").padStart(2, "0")}:00` : datum;
}

/** Leesbaar label voor de as van een grafiek. */
export function formatBucketLabel(label: string, bucket: Bucket): string {
  if (bucket === "hour") return `${label.slice(11, 13)}:00`;
  const d = new Date(`${label}T12:00:00`);
  if (bucket === "month") return d.toLocaleDateString("nl-NL", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}
