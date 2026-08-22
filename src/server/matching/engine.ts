import { haversineKm } from "@/lib/geo";

/**
 * Deterministische, uitlegbare matching engine (pure functie, geen DB/HTTP).
 * Zie docs/MATCHING.md. Harde filters sluiten uit of markeren als ongeschikt;
 * de gewogen subscores leveren de eindscore mét uitleg.
 */

export interface MatchWeights {
  vakgebied: number;
  beschikbaarheid: number;
  specialisatie: number;
  locatie: number;
  tarief: number;
  ervaring: number;
  certificaten: number;
  betrouwbaarheid: number;
}

export const STANDAARD_GEWICHTEN: MatchWeights = {
  vakgebied: 25,
  beschikbaarheid: 20,
  specialisatie: 15,
  locatie: 15,
  tarief: 10,
  ervaring: 5,
  certificaten: 5,
  betrouwbaarheid: 5,
};

export interface MatchJobInput {
  skillId: string;
  specializationIds: string[];
  hardCertificationIds: string[];
  startdatum: Date;
  einddatum: Date | null;
  gewenstUurtariefCents: number | null;
  eigenGereedschapGewenst: boolean;
  lat: number | null;
  lng: number | null;
}

export interface MatchZzpInput {
  skillIds: string[];
  specializationIds: string[];
  certificationIds: string[];
  uurtariefCents: number | null;
  jarenErvaring: number | null;
  maxReisafstandKm: number | null;
  lat: number | null;
  lng: number | null;
  availability: { van: Date; tot: Date | null }[];
  startdatum: Date | null;
  profielCompleetheidPct: number;
  reviewGemiddelde: number | null;
  afgerondeOpdrachten: number;
  eigenBus: boolean;
  eigenGereedschap: boolean;
}

export type SubscoreKey = keyof MatchWeights;

export interface Subscore {
  score: number; // 0..1
  gewicht: number;
}

export interface MatchResult {
  score: number; // 0..100
  geschikt: boolean; // false bij ontbrekende harde certificering
  uitgesloten: boolean; // verkeerd vakgebied of niet beschikbaar
  redenUitsluiting?: string;
  subscores: Record<SubscoreKey, Subscore>;
  redenen: string[];
  aandachtspunten: string[];
  afstandKm: number | null;
}

const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

function isBeschikbaar(
  zzp: MatchZzpInput,
  start: Date,
  eind: Date,
): { status: "ja" | "nee" | "onbekend" } {
  if (zzp.availability.length > 0) {
    const overlap = zzp.availability.some(
      (a) => a.van <= eind && (a.tot === null || a.tot >= start),
    );
    return { status: overlap ? "ja" : "nee" };
  }
  if (zzp.startdatum) {
    return { status: zzp.startdatum <= start ? "ja" : "nee" };
  }
  return { status: "onbekend" };
}

export function scoreMatch(
  job: MatchJobInput,
  zzp: MatchZzpInput,
  weights: MatchWeights = STANDAARD_GEWICHTEN,
  opts: { maxAfstandKm: number } = { maxAfstandKm: 150 },
): MatchResult {
  const redenen: string[] = [];
  const aandachtspunten: string[] = [];

  const leeg = (): Record<SubscoreKey, Subscore> => ({
    vakgebied: { score: 0, gewicht: weights.vakgebied },
    beschikbaarheid: { score: 0, gewicht: weights.beschikbaarheid },
    specialisatie: { score: 0, gewicht: weights.specialisatie },
    locatie: { score: 0, gewicht: weights.locatie },
    tarief: { score: 0, gewicht: weights.tarief },
    ervaring: { score: 0, gewicht: weights.ervaring },
    certificaten: { score: 0, gewicht: weights.certificaten },
    betrouwbaarheid: { score: 0, gewicht: weights.betrouwbaarheid },
  });

  // ── Harde filter: vakgebied ────────────────────────────────────────────────
  if (!zzp.skillIds.includes(job.skillId)) {
    return {
      score: 0,
      geschikt: false,
      uitgesloten: true,
      redenUitsluiting: "Ander vakgebied",
      subscores: leeg(),
      redenen: [],
      aandachtspunten: ["Ander vakgebied"],
      afstandKm: null,
    };
  }

  const subscores = leeg();
  subscores.vakgebied.score = 1;
  redenen.push("Vakgebied komt overeen");

  // ── Harde filter: beschikbaarheid ──────────────────────────────────────────
  const eind = job.einddatum ?? job.startdatum;
  const beschikbaar = isBeschikbaar(zzp, job.startdatum, eind);
  if (beschikbaar.status === "nee") {
    return {
      score: 0,
      geschikt: false,
      uitgesloten: true,
      redenUitsluiting: "Niet beschikbaar in deze periode",
      subscores,
      redenen,
      aandachtspunten: ["Niet beschikbaar in deze periode"],
      afstandKm: null,
    };
  }
  if (beschikbaar.status === "ja") {
    subscores.beschikbaarheid.score = 1;
    redenen.push("Beschikbaar in de gevraagde periode");
  } else {
    subscores.beschikbaarheid.score = 0.3;
    aandachtspunten.push("Beschikbaarheid onbekend");
  }

  // ── Afstand ────────────────────────────────────────────────────────────────
  let afstandKm: number | null = null;
  if (
    job.lat != null &&
    job.lng != null &&
    zzp.lat != null &&
    zzp.lng != null
  ) {
    afstandKm = Math.round(
      haversineKm(
        { lat: job.lat, lng: job.lng },
        { lat: zzp.lat, lng: zzp.lng },
      ),
    );
  }

  if (afstandKm != null && afstandKm > opts.maxAfstandKm) {
    return {
      score: 0,
      geschikt: false,
      uitgesloten: true,
      redenUitsluiting: "Te ver weg",
      subscores,
      redenen,
      aandachtspunten: [`Te ver weg (${afstandKm} km)`],
      afstandKm,
    };
  }

  // ── Locatie-subscore ───────────────────────────────────────────────────────
  if (afstandKm == null) {
    subscores.locatie.score = 0.6;
    aandachtspunten.push("Afstand onbekend");
  } else {
    const ref = zzp.maxReisafstandKm ?? 50;
    let locScore =
      afstandKm <= ref
        ? 1 - 0.5 * (afstandKm / ref)
        : Math.max(0, 0.5 - 0.5 * ((afstandKm - ref) / ref));
    if (zzp.eigenBus) locScore = Math.min(1, locScore + 0.1);
    subscores.locatie.score = clamp01(locScore);
    if (zzp.maxReisafstandKm != null && afstandKm <= zzp.maxReisafstandKm) {
      redenen.push(`Binnen ${afstandKm} km`);
    } else {
      aandachtspunten.push(`Op ${afstandKm} km`);
    }
  }

  // ── Specialisatie ──────────────────────────────────────────────────────────
  if (job.specializationIds.length === 0) {
    subscores.specialisatie.score = 1;
  } else {
    const raak = job.specializationIds.filter((id) =>
      zzp.specializationIds.includes(id),
    ).length;
    subscores.specialisatie.score = raak / job.specializationIds.length;
    if (raak === job.specializationIds.length) {
      redenen.push("Alle gevraagde specialisaties aanwezig");
    } else if (raak > 0) {
      aandachtspunten.push("Niet alle specialisaties aanwezig");
    } else {
      aandachtspunten.push("Gevraagde specialisatie ontbreekt");
    }
  }

  // ── Tarief ─────────────────────────────────────────────────────────────────
  if (job.gewenstUurtariefCents == null || zzp.uurtariefCents == null) {
    subscores.tarief.score = 0.7;
  } else if (zzp.uurtariefCents <= job.gewenstUurtariefCents) {
    subscores.tarief.score = 1;
    redenen.push("Tarief binnen budget");
  } else {
    const over =
      (zzp.uurtariefCents - job.gewenstUurtariefCents) /
      job.gewenstUurtariefCents;
    subscores.tarief.score = clamp01(1 - over * 2);
    aandachtspunten.push("Tarief boven budget");
  }

  // ── Ervaring ───────────────────────────────────────────────────────────────
  subscores.ervaring.score =
    zzp.jarenErvaring == null ? 0.3 : clamp01(zzp.jarenErvaring / 10);

  // ── Certificaten (harde vereisten bepalen ook geschiktheid) ────────────────
  let geschikt = true;
  if (job.hardCertificationIds.length === 0) {
    subscores.certificaten.score = 1;
  } else {
    const aanwezig = job.hardCertificationIds.filter((id) =>
      zzp.certificationIds.includes(id),
    ).length;
    subscores.certificaten.score = aanwezig / job.hardCertificationIds.length;
    if (aanwezig === job.hardCertificationIds.length) {
      redenen.push("Vereiste certificaten aanwezig");
    } else {
      geschikt = false;
      aandachtspunten.push("Vereist certificaat ontbreekt");
    }
  }

  // ── Betrouwbaarheid ────────────────────────────────────────────────────────
  const reviewDeel =
    zzp.reviewGemiddelde == null ? 0.5 : clamp01(zzp.reviewGemiddelde / 5);
  const opdrachtenDeel = clamp01(zzp.afgerondeOpdrachten / 5);
  const compleetDeel = clamp01(zzp.profielCompleetheidPct / 100);
  let betrouw = 0.5 * reviewDeel + 0.25 * opdrachtenDeel + 0.25 * compleetDeel;
  if (job.eigenGereedschapGewenst && zzp.eigenGereedschap) {
    betrouw = Math.min(1, betrouw + 0.1);
    redenen.push("Eigen gereedschap aanwezig");
  }
  subscores.betrouwbaarheid.score = clamp01(betrouw);

  // ── Gewogen eindscore ──────────────────────────────────────────────────────
  const totaalGewicht = Object.values(subscores).reduce(
    (s, x) => s + x.gewicht,
    0,
  );
  const behaald = Object.values(subscores).reduce(
    (s, x) => s + x.score * x.gewicht,
    0,
  );
  const score =
    totaalGewicht > 0 ? Math.round((behaald / totaalGewicht) * 100) : 0;

  return {
    score,
    geschikt,
    uitgesloten: false,
    subscores,
    redenen,
    aandachtspunten,
    afstandKm,
  };
}
