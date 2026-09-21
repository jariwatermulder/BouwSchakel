import { describe, expect, it } from "vitest";
import { isGeldigKvkFormaat, kiesKvkResultaat, kvkControleTekst, normaliseerKvk } from "@/lib/kvk";
import { kvkNummerSchema } from "@/lib/validations/kvk";

describe("kvk-helpers", () => {
  it("normaliseert spaties, punten en streepjes", () => {
    expect(normaliseerKvk("12 345 678")).toBe("12345678");
    expect(normaliseerKvk("1234.5678")).toBe("12345678");
    expect(normaliseerKvk(" 12-34-56-78 ")).toBe("12345678");
    expect(normaliseerKvk(null)).toBe("");
  });

  it("accepteert alleen 8 cijfers als formaat", () => {
    expect(isGeldigKvkFormaat("12345678")).toBe(true);
    expect(isGeldigKvkFormaat("1234567")).toBe(false);
    expect(isGeldigKvkFormaat("1234567a")).toBe(false);
    expect(isGeldigKvkFormaat("00000000")).toBe(false);
  });

  it("valideert en normaliseert via het zod-schema", () => {
    expect(kvkNummerSchema.safeParse("12 345 678")).toMatchObject({ success: true, data: "12345678" });
    expect(kvkNummerSchema.safeParse("").success).toBe(false);
    expect(kvkNummerSchema.safeParse(undefined).success).toBe(false);
    expect(kvkNummerSchema.safeParse("123").success).toBe(false);
  });

  it("kiest de hoofdvestiging uit een Zoeken-API-antwoord", () => {
    const antwoord = {
      totaal: 3,
      resultaten: [
        { kvkNummer: "12345678", naam: "Nevenzaak", type: "nevenvestiging", adres: { binnenlandsAdres: { plaats: "Assen" } } },
        { kvkNummer: "12345678", naam: "Jansen Timmerwerken", type: "hoofdvestiging", adres: { binnenlandsAdres: { plaats: "Groningen" } } },
        { kvkNummer: "87654321", naam: "Ander bedrijf", type: "hoofdvestiging" },
      ],
    };
    expect(kiesKvkResultaat(antwoord, "12345678")).toEqual({ naam: "Jansen Timmerwerken", plaats: "Groningen" });
    expect(kiesKvkResultaat(antwoord, "11111111")).toBeNull();
    expect(kiesKvkResultaat({ resultaten: [] }, "12345678")).toBeNull();
    expect(kiesKvkResultaat(null, "12345678")).toBeNull();
    expect(kiesKvkResultaat({ resultaten: [{ kvkNummer: "12345678", naam: "Alleen rechtspersoon", type: "rechtspersoon" }] }, "12345678")).toEqual({
      naam: "Alleen rechtspersoon",
      plaats: null,
    });
  });

  it("geeft een leesbare tekst per resultaat", () => {
    expect(kvkControleTekst({ status: "gevonden", kvkNummer: "12345678", naam: "Jansen", plaats: "Groningen" })).toContain("Jansen, Groningen");
    expect(kvkControleTekst({ status: "niet_gevonden", kvkNummer: "12345678" })).toContain("niet in het Handelsregister");
    expect(kvkControleTekst({ status: "niet_beschikbaar", kvkNummer: "12345678" })).toContain("verdergaan");
  });
});
