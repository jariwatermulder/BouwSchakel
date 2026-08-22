import { describe, expect, it } from "vitest";
import { slugify, slugWithSuffix } from "@/lib/slug";

describe("slugify", () => {
  it("maakt een nette slug", () => {
    expect(slugify("Timmerman Groningen")).toBe("timmerman-groningen");
  });

  it("verwijdert diakritische tekens en speciale tekens", () => {
    expect(slugify("Stukadoor & Méér!")).toBe("stukadoor-meer");
  });
});

describe("slugWithSuffix", () => {
  it("combineert delen en voegt een suffix toe", () => {
    const slug = slugWithSuffix("Timmerman", "Groningen");
    expect(slug).toMatch(/^timmerman-groningen-[0-9a-f]{6}$/u);
  });

  it("valt terug op 'opdracht' bij lege invoer", () => {
    expect(slugWithSuffix("")).toMatch(/^opdracht-[0-9a-f]{6}$/u);
  });
});
