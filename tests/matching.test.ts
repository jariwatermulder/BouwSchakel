import { describe, expect, it } from "vitest";
import {
  scoreMatch,
  type MatchJobInput,
  type MatchZzpInput,
} from "@/server/matching/engine";

const GRONINGEN = { lat: 53.2194, lng: 6.5665 };
const HAREN = { lat: 53.1739, lng: 6.6017 }; // ~6 km
const ASSEN = { lat: 52.9925, lng: 6.5649 }; // ~25 km

function job(overrides: Partial<MatchJobInput> = {}): MatchJobInput {
  return {
    skillId: "skill-timmerman",
    specializationIds: [],
    hardCertificationIds: [],
    startdatum: new Date("2026-09-01"),
    einddatum: null,
    gewenstUurtariefCents: 4500,
    eigenGereedschapGewenst: false,
    lat: GRONINGEN.lat,
    lng: GRONINGEN.lng,
    ...overrides,
  };
}

function zzp(overrides: Partial<MatchZzpInput> = {}): MatchZzpInput {
  return {
    skillIds: ["skill-timmerman"],
    specializationIds: [],
    certificationIds: [],
    uurtariefCents: 4000,
    jarenErvaring: 8,
    maxReisafstandKm: 50,
    lat: HAREN.lat,
    lng: HAREN.lng,
    availability: [
      { van: new Date("2026-08-01"), tot: new Date("2026-12-01") },
    ],
    startdatum: null,
    profielCompleetheidPct: 90,
    reviewGemiddelde: null,
    afgerondeOpdrachten: 0,
    eigenBus: false,
    eigenGereedschap: false,
    ...overrides,
  };
}

describe("matching engine — harde filters", () => {
  it("sluit een ander vakgebied uit", () => {
    const r = scoreMatch(job(), zzp({ skillIds: ["skill-metselaar"] }));
    expect(r.uitgesloten).toBe(true);
    expect(r.score).toBe(0);
  });

  it("sluit niet-beschikbaar uit", () => {
    const r = scoreMatch(
      job(),
      zzp({
        availability: [
          { van: new Date("2026-01-01"), tot: new Date("2026-02-01") },
        ],
      }),
    );
    expect(r.uitgesloten).toBe(true);
  });

  it("markeert ontbrekend verplicht certificaat als ongeschikt (maar niet uitgesloten)", () => {
    const r = scoreMatch(job({ hardCertificationIds: ["cert-vca"] }), zzp());
    expect(r.uitgesloten).toBe(false);
    expect(r.geschikt).toBe(false);
  });

  it("sluit uit boven de maximale afstand", () => {
    const ver = { lat: 52.09, lng: 5.12 }; // Utrecht, ~150+ km
    const r = scoreMatch(
      job(),
      zzp({ lat: ver.lat, lng: ver.lng }),
      undefined,
      {
        maxAfstandKm: 100,
      },
    );
    expect(r.uitgesloten).toBe(true);
  });
});

describe("matching engine — scoring", () => {
  it("beschikbaar op 25 km verslaat niet-beschikbaar op 6 km", () => {
    const beschikbaarVer = scoreMatch(
      job(),
      zzp({ lat: ASSEN.lat, lng: ASSEN.lng }),
    );
    const nietBeschikbaarDichtbij = scoreMatch(
      job(),
      zzp({
        lat: HAREN.lat,
        lng: HAREN.lng,
        availability: [
          { van: new Date("2026-01-01"), tot: new Date("2026-02-01") },
        ],
      }),
    );
    expect(nietBeschikbaarDichtbij.uitgesloten).toBe(true);
    expect(beschikbaarVer.score).toBeGreaterThan(nietBeschikbaarDichtbij.score);
  });

  it("dichterbij levert een hogere locatiescore", () => {
    const dichtbij = scoreMatch(job(), zzp({ lat: HAREN.lat, lng: HAREN.lng }));
    const verder = scoreMatch(job(), zzp({ lat: ASSEN.lat, lng: ASSEN.lng }));
    expect(dichtbij.subscores.locatie.score).toBeGreaterThan(
      verder.subscores.locatie.score,
    );
  });

  it("tarief binnen budget scoort hoger dan ver boven budget", () => {
    const binnen = scoreMatch(job(), zzp({ uurtariefCents: 4000 }));
    const boven = scoreMatch(job(), zzp({ uurtariefCents: 9000 }));
    expect(binnen.subscores.tarief.score).toBe(1);
    expect(boven.subscores.tarief.score).toBeLessThan(1);
  });

  it("een sterke match geeft een hoge score en uitleg", () => {
    const r = scoreMatch(job(), zzp());
    expect(r.score).toBeGreaterThan(70);
    expect(r.redenen).toContain("Vakgebied komt overeen");
    expect(r.redenen).toContain("Tarief binnen budget");
  });
});
