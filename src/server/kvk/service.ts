import "server-only";
import { isGeldigKvkFormaat, kiesKvkResultaat, normaliseerKvk, type KvkControle } from "@/lib/kvk";

/**
 * KvK-controle via de officiële KvK Zoeken API (v2). Vereist een API-sleutel
 * (KVK_API_KEY, zie docs/KVK.md). Zonder sleutel of bij een storing valt de
 * controle terug op alleen het formaat ("niet_beschikbaar"): registreren blijft
 * dan gewoon mogelijk, want een storing bij de KvK mag nooit onze gebruikers
 * blokkeren.
 */

const STANDAARD_URL = "https://api.kvk.nl/api/v2/zoeken";
const TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;

const cache = new Map<string, { resultaat: KvkControle; tot: number }>();

export function kvkApiBeschikbaar(env: Record<string, string | undefined> = process.env): boolean {
  return !!env.KVK_API_KEY?.trim();
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

  const sleutel = process.env.KVK_API_KEY?.trim();
  if (!sleutel) return { status: "niet_beschikbaar", kvkNummer };

  const gecachet = uitCache(kvkNummer);
  if (gecachet) return gecachet;

  const url = new URL(process.env.KVK_API_URL?.trim() || STANDAARD_URL);
  url.searchParams.set("kvkNummer", kvkNummer);
  url.searchParams.set("resultatenPerPagina", "10");

  try {
    const res = await fetch(url, {
      headers: { apikey: sleutel, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    // De Zoeken API antwoordt met 404 als er geen enkel resultaat is.
    if (res.status === 404) {
      const r: KvkControle = { status: "niet_gevonden", kvkNummer };
      inCache(kvkNummer, r);
      return r;
    }
    if (!res.ok) {
      console.error(`KvK-API antwoordde met ${res.status} voor een controle`);
      return { status: "niet_beschikbaar", kvkNummer };
    }
    const gekozen = kiesKvkResultaat(await res.json(), kvkNummer);
    const r: KvkControle = gekozen
      ? { status: "gevonden", kvkNummer, naam: gekozen.naam, plaats: gekozen.plaats }
      : { status: "niet_gevonden", kvkNummer };
    inCache(kvkNummer, r);
    return r;
  } catch (e) {
    console.error("KvK-API niet bereikbaar:", e instanceof Error ? e.message : e);
    return { status: "niet_beschikbaar", kvkNummer };
  }
}

/** Velden die we na een controle bij het profiel opslaan (null als niet gecontroleerd). */
export function kvkOpslagVelden(c: KvkControle): { kvkNaam: string | null; kvkGecontroleerdOp: Date | null } {
  return c.status === "gevonden"
    ? { kvkNaam: c.naam, kvkGecontroleerdOp: new Date() }
    : { kvkNaam: null, kvkGecontroleerdOp: null };
}
