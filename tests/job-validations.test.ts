import { describe, expect, it } from "vitest";
import { jobSchema } from "@/lib/validations/job";
import { companySchema } from "@/lib/validations/company";

const geldigeJob = {
  skillId: "11111111-1111-4111-8111-111111111111",
  locatiePlaats: "Groningen",
  startdatum: "2026-09-01",
  omschrijving: "Renovatie van woningen, ervaren timmerman gezocht.",
};

describe("job validatie", () => {
  it("accepteert een geldige minimale opdracht", () => {
    const r = jobSchema.safeParse(geldigeJob);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.aantalPersonen).toBe(1);
  });

  it("vereist een geldig vakgebied (uuid)", () => {
    expect(
      jobSchema.safeParse({ ...geldigeJob, skillId: "geen-uuid" }).success,
    ).toBe(false);
  });

  it("weigert een te korte omschrijving", () => {
    expect(
      jobSchema.safeParse({ ...geldigeJob, omschrijving: "te kort" }).success,
    ).toBe(false);
  });

  it("lege optionele specialisatie wordt genegeerd", () => {
    const r = jobSchema.safeParse({ ...geldigeJob, specializationId: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.specializationId).toBeUndefined();
  });
});

describe("company validatie", () => {
  it("vereist een bedrijfsnaam", () => {
    expect(companySchema.safeParse({ naam: "" }).success).toBe(false);
    expect(companySchema.safeParse({ naam: "Bouwbedrijf X" }).success).toBe(
      true,
    );
  });

  it("weigert een ongeldige website", () => {
    expect(
      companySchema.safeParse({ naam: "X", website: "geen-url" }).success,
    ).toBe(false);
    expect(
      companySchema.safeParse({ naam: "X", website: "https://x.nl" }).success,
    ).toBe(true);
  });
});
