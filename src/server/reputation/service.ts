import "server-only";
import { db } from "@/lib/db";
import { combineerCategorieGemiddelden } from "@/server/reviews/scoring";

export interface Reputatie {
  reviewGemiddelde: number | null; // 1..5
  aantalReviews: number;
  afgerondeOpdrachten: number;
}

const LEEG: Reputatie = {
  reviewGemiddelde: null,
  aantalReviews: 0,
  afgerondeOpdrachten: 0,
};

/**
 * Reputatie (reviewgemiddelde + aantal afgeronde opdrachten) voor een set
 * ZZP-profielen, in twee gegroepeerde queries (geen N+1).
 */
export async function getReputatie(
  zzpProfileIds: string[],
): Promise<Map<string, Reputatie>> {
  const result = new Map<string, Reputatie>();
  if (zzpProfileIds.length === 0) return result;

  const [reviews, assignments] = await Promise.all([
    db.review.groupBy({
      by: ["overZzpProfileId"],
      where: {
        richting: "BEDRIJF_NAAR_ZZP",
        overZzpProfileId: { in: zzpProfileIds },
      },
      _avg: {
        scoreKwaliteit: true,
        scoreCommunicatie: true,
        scoreBetrouwbaarheid: true,
        scoreAfspraken: true,
      },
      _count: { _all: true },
    }),
    db.assignment.groupBy({
      by: ["zzpProfileId"],
      where: { zzpProfileId: { in: zzpProfileIds }, status: "AFGEROND" },
      _count: { _all: true },
    }),
  ]);

  for (const id of zzpProfileIds) result.set(id, { ...LEEG });

  for (const r of reviews) {
    if (!r.overZzpProfileId) continue;
    const rep = result.get(r.overZzpProfileId) ?? { ...LEEG };
    rep.reviewGemiddelde = combineerCategorieGemiddelden({
      kwaliteit: r._avg.scoreKwaliteit,
      communicatie: r._avg.scoreCommunicatie,
      betrouwbaarheid: r._avg.scoreBetrouwbaarheid,
      afspraken: r._avg.scoreAfspraken,
    });
    rep.aantalReviews = r._count._all;
    result.set(r.overZzpProfileId, rep);
  }

  for (const a of assignments) {
    const rep = result.get(a.zzpProfileId) ?? { ...LEEG };
    rep.afgerondeOpdrachten = a._count._all;
    result.set(a.zzpProfileId, rep);
  }

  return result;
}

export async function getReputatieVoor(
  zzpProfileId: string,
): Promise<Reputatie> {
  return (await getReputatie([zzpProfileId])).get(zzpProfileId) ?? { ...LEEG };
}
