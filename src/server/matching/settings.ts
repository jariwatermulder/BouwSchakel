import "server-only";
import { db } from "@/lib/db";
import {
  STANDAARD_GEWICHTEN,
  type MatchWeights,
} from "@/server/matching/engine";

export interface MatchingConfig {
  weights: MatchWeights;
  minMatchScore: number;
  maxAfstandKm: number;
}

/** Laadt de matching-instellingen uit de database, met defaults als fallback. */
export async function getMatchingConfig(): Promise<MatchingConfig> {
  const row = await db.matchingSetting.findUnique({ where: { id: "default" } });
  if (!row) {
    return {
      weights: STANDAARD_GEWICHTEN,
      minMatchScore: 50,
      maxAfstandKm: 150,
    };
  }
  return {
    weights: {
      vakgebied: row.gewichtVakgebied,
      beschikbaarheid: row.gewichtBeschikbaarheid,
      specialisatie: row.gewichtSpecialisatie,
      locatie: row.gewichtLocatie,
      tarief: row.gewichtTarief,
      ervaring: row.gewichtErvaring,
      certificaten: row.gewichtCertificaten,
      betrouwbaarheid: row.gewichtBetrouwbaarheid,
    },
    minMatchScore: row.minMatchScore,
    maxAfstandKm: row.maxAfstandKm,
  };
}
