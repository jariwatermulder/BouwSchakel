import "server-only";
import { isGeldigKvkFormaat, kiesKvkResultaat, normaliseerKvk, type KvkControle } from "@/lib/kvk";

/**
 * KvK-controle via de officiële KvK Zoeken API (v2). Vereist een API-sleutel
 * (KVK_API_KEY, zie docs/KVK.md). Zonder sleutel of bij een storing valt de
 * controle terug op alleen het formaat ("niet_beschikbaar"): registreren blijft
 * dan gewoon mogelijk, want een storing bij de KvK mag nooit onze gebruikers
 * blokkeren.
 */

const PRODUCTIE_URL = "https://api.kvk.nl/api/v2/zoeken";
/**
 * KvK-testomgeving met de openbare testsleutel uit de KvK-documentatie
 * (developers.kvk.nl). Geen geheim: iedereen mag hiermee de testomgeving
 * bevragen. Er bestaan daar alleen testbedrijven (bijv. 68750110 "Test BV").
 */
const TEST_URL = "https://api.kvk.nl/test/api/v2/zoeken";
const TEST_SLEUTEL = "l7xx1f2691f2520d487b9b17e7ddb3f3b9dc";
const TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;

const cache = new Map<string, { resultaat: KvkControle; tot: number }>();

export interface KvkModus {
  /** null = controle uitgeschakeld (KVK_CONTROLE=uit). */
  url: string | null;
  sleutel: string;
  /** Testomgeving (geen eigen sleutel): resultaten tellen niet als echte controle. */
  test: boolean;
}

/**
 * Bepaalt welke KvK-omgeving wordt gebruikt:
 * - KVK_CONTROLE=uit → geen controle (alleen formaat);
 * - KVK_API_KEY gezet → productie-Handelsregister (KVK_API_URL kan de URL overschrijven);
 * - anders → KvK-testomgeving met de openbare testsleutel (KVK_API_URL mag ook hier overschrijven).
 */
export function kvkModus(env: Record<string, string | undefined> = process.env): KvkModus {
  if (env.KVK_CONTROLE?.trim().toLowerCase() === "uit") return { url: null, sleutel: "", test: false };
  const eigen = env.KVK_API_KEY?.trim();
  const url = env.KVK_API_URL?.trim();
  if (eigen) return { url: url || PRODUCTIE_URL, sleutel: eigen, test: false };
  return { url: url || TEST_URL, sleutel: TEST_SLEUTEL, test: true };
}

function uitCache(nummer: string): KvkControle | null {
  const hit = cache.get(nummer);
  if (!hit) return null;
  if (hit.tot < Date.now()) {
    cache.delete(nummer);
    return null;
  }
  return hit.resultaat;
}

function inCache(nummer: string, resultaat: KvkControle): void {
  if (cache.size >= CACHE_MAX) {
    const oudste = cache.keys().next().value;
    if (oudste) cache.delete(oudste);
  }
  cache.set(nummer, { resultaat, tot: Date.now() + CACHE_TTL_MS });
}

/** Alleen voor tests. */
export function __resetKvkCache(): void {
  cache.clear();
}

/**
 * Controleert een KvK-nummer. Het resultaat "gevonden"/"niet_gevonden" komt
 * uit het Handelsregister en wordt 24 uur gecachet; "niet_beschikbaar" wordt
 * niet gecachet zodat een tijdelijke storing zichzelf herstelt.
 */
export async function controleerKvk(input: unknown): Promise<KvkControle> {
  const kvkNummer = normaliseerKvk(input);
  if (!isGeldigKvkFormaat(kvkNummer)) return { status: "ongeldig", kvkNummer };

  const modus = kvkModus();
  if (!modus.url) return { status: "niet_beschikbaar", kvkNummer };
  const test = modus.test;

  const gecachet = uitCache(kvkNummer);
  if (gecachet) return gecachet;

  const url = new URL(modus.url);
  url.searchParams.set("kvkNummer", kvkNummer);
  url.searchParams.set("resultatenPerPagina", "10");

  try {
    const res = await fetch(url, {
      headers: { apikey: modus.sleutel, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // De Zoeken API antwoordt met 404 als er geen enkel resultaat is.
    if (res.status === 404) {
      const r: KvkControle = { status: "niet_gevonden", kvkNummer, test };
      inCache(kvkNummer, r);
      return r;
    }
    if (!res.ok) {
      console.error(`KvK-API antwoordde met ${res.status} voor een controle`);
      return { status: "niet_beschikbaar", kvkNummer, test };
    }
    const gekozen = kiesKvkResultaat(await res.json(), kvkNummer);
    const r: KvkControle = gekozen
      ? { status: "gevonden", kvkNummer, naam: gekozen.naam, plaats: gekozen.plaats, test }
      : { status: "niet_gevonden", kvkNummer, test };
    inCache(kvkNummer, r);
    return r;
  } catch (e) {
    console.error("KvK-API niet bereikbaar:", e instanceof Error ? e.message : e);
    return { status: "niet_beschikbaar", kvkNummer, test };
  }
}

/**
 * Velden die we na een controle bij het profiel opslaan. Alleen een echte
 * treffer in het Handelsregister telt; een testresultaat wordt niet bewaard.
 */
export function kvkOpslagVelden(c: KvkControle): { kvkNaam: string | null; kvkGecontroleerdOp: Date | null } {
  return c.status === "gevonden" && !c.test
    ? { kvkNaam: c.naam, kvkGecontroleerdOp: new Date() }
    : { kvkNaam: null, kvkGecontroleerdOp: null };
}
