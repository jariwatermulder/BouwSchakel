import { describe, expect, it } from "vitest";
import {
  bedrijfSchema,
  persoonlijkSchema,
  tariefSchema,
  vakgebiedSchema,
  werkgebiedSchema,
} from "@/lib/validations/zzp";

describe("zzp registratie validaties", () => {
  it("persoonlijk vereist voor- en achternaam", () => {
    expect(
      persoonlijkSchema.safeParse({ voornaam: "Jan", achternaam: "Jansen" })
        .success,
    ).toBe(true);
    expect(
      persoonlijkSchema.safeParse({ voornaam: "", achternaam: "Jansen" })
        .success,
    ).toBe(false);
  });

  it("kvk moet 8 cijfers zijn maar is optioneel", () => {
    expect(bedrijfSchema.safeParse({ kvkNummer: "12345678" }).success).toBe(
      true,
    );
    expect(bedrijfSchema.safeParse({ kvkNummer: "" }).success).toBe(true);
    expect(bedrijfSchema.safeParse({ kvkNummer: "123" }).success).toBe(false);
  });

  it("vakgebied vereist minstens één skill", () => {
    expect(vakgebiedSchema.safeParse({ skillIds: [] }).success).toBe(false);
  });

  it("tarief buiten grenzen wordt geweigerd", () => {
    expect(tariefSchema.safeParse({ uurtariefEuro: "45" }).success).toBe(true);
    expect(tariefSchema.safeParse({ uurtariefEuro: "0" }).success).toBe(false);
    expect(tariefSchema.safeParse({ uurtariefEuro: "9999" }).success).toBe(
      false,
    );
  });

  it("werkgebied vereist plaats en reisafstand binnen grenzen", () => {
    expect(
      werkgebiedSchema.safeParse({
        werkgebiedPlaats: "Assen",
        maxReisafstandKm: "40",
      }).success,
    ).toBe(true);
    expect(
      werkgebiedSchema.safeParse({
        werkgebiedPlaats: "Assen",
        maxReisafstandKm: "999",
      }).success,
    ).toBe(false);
  });
});
