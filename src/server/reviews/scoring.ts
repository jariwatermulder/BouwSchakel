/**
 * Pure helpers voor review-scores. Een review heeft vier categorieën (1–5);
 * het gemiddelde daarvan is de review-score. De reputatie van een ZZP'er is het
 * gemiddelde over alle ontvangen reviews. Zie docs/MATCHING.md (betrouwbaarheid).
 */
export interface ReviewScores {
  scoreKwaliteit: number;
  scoreCommunicatie: number;
  scoreBetrouwbaarheid: number;
  scoreAfspraken: number;
}

export function reviewGemiddelde(s: ReviewScores): number {
  return (
    (s.scoreKwaliteit +
      s.scoreCommunicatie +
      s.scoreBetrouwbaarheid +
      s.scoreAfspraken) /
    4
  );
}

/** Combineert per-categorie gemiddelden (uit een aggregatie) tot één cijfer. */
export function combineerCategorieGemiddelden(avgs: {
  kwaliteit: number | null;
  communicatie: number | null;
  betrouwbaarheid: number | null;
  afspraken: number | null;
}): number | null {
  const waarden = [
    avgs.kwaliteit,
    avgs.communicatie,
    avgs.betrouwbaarheid,
    avgs.afspraken,
  ].filter((v): v is number => v != null);
  if (waarden.length === 0) return null;
  return waarden.reduce((a, b) => a + b, 0) / waarden.length;
}
