import { describe, expect, it } from "vitest";
import { geocodeNL, haversineKm } from "@/lib/geo";

describe("geo", () => {
  it("haversine berekent een plausibele afstand Groningen–Assen", () => {
    const gron = geocodeNL("Groningen");
    const assen = geocodeNL("Assen");
    expect(gron).not.toBeNull();
    expect(assen).not.toBeNull();
    const km = haversineKm(gron!, assen!);
    expect(km).toBeGreaterThan(20);
    expect(km).toBeLessThan(35);
  });

  it("geocodeNL is hoofdletterongevoelig en trimt", () => {
    expect(geocodeNL("  GRONINGEN ")).toEqual(geocodeNL("groningen"));
  });

  it("geeft null voor een onbekende plaats", () => {
    expect(geocodeNL("Verweggistan")).toBeNull();
  });
});
