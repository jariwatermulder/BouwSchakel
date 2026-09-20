import { describe, expect, it } from "vitest";
import { parseUserAgent } from "@/lib/analytics/ua";
import { bronNaam, referrerHost } from "@/lib/analytics/bronnen";
import { CLIENT_EVENTS, EVENT_NAMES, isEventName } from "@/lib/analytics/events";
import { bucketLabels, parsePeriode } from "@/server/analytics/periode";

describe("user-agent classificatie", () => {
  it("herkent desktop, mobiel en tablet zonder de ruwe string te bewaren", () => {
    expect(parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36")).toEqual({
      deviceType: "desktop",
      browser: "Chrome",
      os: "Windows",
    });
    expect(parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1").deviceType).toBe("mobile");
    expect(parseUserAgent("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1").deviceType).toBe("tablet");
    expect(parseUserAgent("Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36 SamsungBrowser/23.0").browser).toBe("Samsung Internet");
    expect(parseUserAgent(null).deviceType).toBe("onbekend");
  });
});

describe("herkomst", () => {
  it("bewaart alleen de hostnaam en herkent bekende bronnen", () => {
    expect(referrerHost("https://www.google.com/search?q=zzp+schakel")).toBe("google.com");
    expect(referrerHost("https://zzpschakel.nl/vind-zzper", "zzpschakel.nl")).toBeNull();
    expect(referrerHost("niet-een-url")).toBeNull();
    expect(bronNaam("google.com", null)).toBe("Google");
    expect(bronNaam("l.instagram.com", null)).toBe("Instagram");
    expect(bronNaam("marktplaats.nl", null)).toBe("Marktplaats");
    expect(bronNaam(null, null)).toBe("Direct");
    expect(bronNaam("example.org", null)).toBe("Overige websites (example.org)");
    expect(bronNaam("google.com", "nieuwsbrief")).toBe("Nieuwsbrief");
    expect(bronNaam(null, "zomeractie")).toBe("Campagne: zomeractie");
  });
});

describe("event registry", () => {
  it("client-events zijn een deelverzameling van alle events", () => {
    for (const e of CLIENT_EVENTS) expect(EVENT_NAMES).toContain(e);
    expect(isEventName("page_view")).toBe(true);
    expect(isEventName("match_created")).toBe(false);
    expect(isEventName("__proto__")).toBe(false);
  });
});

describe("periodefilter", () => {
  it("valt terug op 30 dagen en levert een even lange vorige periode", () => {
    const p = parsePeriode({ p: "onzin" });
    expect(p.key).toBe("30d");
    expect(p.tot.getTime() - p.van.getTime()).toBe(p.vorigeTot.getTime() - p.vorigeVan.getTime());
    expect(p.vorigeTot.getTime()).toBe(p.van.getTime());
  });
  it("aangepaste periode is inclusief de einddatum", () => {
    const p = parsePeriode({ p: "custom", van: "2026-09-01", tot: "2026-09-07" });
    expect(p.key).toBe("custom");
    expect(Math.round((p.tot.getTime() - p.van.getTime()) / 86_400_000)).toBe(7);
    expect(p.bucket).toBe("day");
    expect(bucketLabels(p.van, p.tot, "day")).toHaveLength(7);
    expect(bucketLabels(p.van, p.tot, "day")[0]).toBe("2026-09-01");
  });
  it("vandaag wordt per uur gebucket met 24 labels", () => {
    const p = parsePeriode({ p: "vandaag" });
    expect(p.bucket).toBe("hour");
    expect(bucketLabels(p.van, p.tot, "hour")).toHaveLength(24);
  });
});
