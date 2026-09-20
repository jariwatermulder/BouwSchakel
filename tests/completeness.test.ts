import { describe, expect, it } from "vitest";
import {
  computeCompleteness,
  type CompletenessInput,
} from "@/server/zzp/completeness";

const leeg: CompletenessInput = {
  skillsCount: 0,
  specializationsCount: 0,
  certificationsCount: 0,
  availabilityCount: 0,
  eigenBus: false,
  eigenGereedschap: false,
  vca: false,
};

describe("computeCompleteness", () => {
  it("een leeg profiel is 0%", () => {
    expect(computeCompleteness(leeg)).toBe(0);
  });

  it("een volledig ingevuld profiel is 100%", () => {
    const vol: CompletenessInput = {
      voornaam: "Jan",
      achternaam: "de Vries",
      telefoon: "0612345678",
      over: "Ervaren timmerman.",
      jarenErvaring: 10,
      uurtariefCents: 4500,
      werkgebiedPlaats: "Groningen",
      maxReisafstandKm: 30,
      startdatum: new Date(),
      skillsCount: 2,
      specializationsCount: 1,
      certificationsCount: 1,
      availabilityCount: 1,
      eigenBus: true,
      eigenGereedschap: true,
      vca: true,
    };
    expect(computeCompleteness(vol)).toBe(100);
  });

  it("kernvelden wegen zwaarder dan optionele", () => {
    const metVak = computeCompleteness({ ...leeg, skillsCount: 1 });
    const metBus = computeCompleteness({ ...leeg, eigenBus: true });
    expect(metVak).toBeGreaterThan(metBus);
  });

  it("percentage ligt altijd tussen 0 en 100", () => {
    const pct = computeCompleteness({
      ...leeg,
      voornaam: "A",
      achternaam: "B",
      skillsCount: 1,
    });
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });
});

describe("completenessOnderdelen", () => {
  it("gewichten tellen op tot 100 en elk onderdeel wijst naar een stap", async () => {
    const { ONDERDELEN, completenessOnderdelen } = await import("@/server/zzp/completeness");
    expect(ONDERDELEN.reduce((s, o) => s + o.gewicht, 0)).toBe(100);
    const leeg = completenessOnderdelen({
      skillsCount: 0,
      specializationsCount: 0,
      certificationsCount: 0,
      availabilityCount: 0,
      eigenBus: false,
      eigenGereedschap: false,
      vca: false,
    });
    expect(leeg.every((o) => !o.vervuld)).toBe(true);
    expect(leeg.reduce((s, o) => s + o.procent, 0)).toBe(100);
    expect(leeg.every((o) => typeof o.stap === "string" && o.label.length > 0)).toBe(true);
  });
});
