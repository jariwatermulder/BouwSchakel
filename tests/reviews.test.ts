import { describe, expect, it } from "vitest";
import {
  combineerCategorieGemiddelden,
  reviewGemiddelde,
} from "@/server/reviews/scoring";

describe("review scoring", () => {
  it("berekent het gemiddelde van de vier categorieën", () => {
    expect(
      reviewGemiddelde({
        scoreKwaliteit: 5,
        scoreCommunicatie: 4,
        scoreBetrouwbaarheid: 4,
        scoreAfspraken: 3,
      }),
    ).toBe(4);
  });

  it("combineert categorie-gemiddelden en negeert ontbrekende", () => {
    expect(
      combineerCategorieGemiddelden({
        kwaliteit: 4,
        communicatie: 4,
        betrouwbaarheid: null,
        afspraken: null,
      }),
    ).toBe(4);
  });

  it("geeft null wanneer er geen scores zijn", () => {
    expect(
      combineerCategorieGemiddelden({
        kwaliteit: null,
        communicatie: null,
        betrouwbaarheid: null,
        afspraken: null,
      }),
    ).toBeNull();
  });
});
