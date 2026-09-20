import "server-only";

/**
 * Kleine in-memory cache met TTL voor dashboardqueries. Voorkomt dat elke
 * paginaweergave alle aggregaties opnieuw berekent; het dashboard ververst
 * zichzelf iedere minuut, dus een TTL van 60 s betekent "hooguit één minuut
 * oud". Per serverinstantie (op Vercel per warme functie); dat is voor een
 * beheerdashboard ruim voldoende.
 */
interface Entry<T> {
  waarde: T;
  bijgewerkt: number;
  verlooptOp: number;
}

const store = new Map<string, Entry<unknown>>();
export const CACHE_TTL_MS = 60 * 1000;

export async function cached<T>(key: string, fn: () => Promise<T>, ttlMs = CACHE_TTL_MS): Promise<T> {
  const nu = Date.now();
  const bestaand = store.get(key) as Entry<T> | undefined;
  if (bestaand && bestaand.verlooptOp > nu) return bestaand.waarde;
  const waarde = await fn();
  store.set(key, { waarde, bijgewerkt: nu, verlooptOp: nu + ttlMs });
  if (store.size > 500) {
    for (const [k, v] of store) if (v.verlooptOp <= nu) store.delete(k);
  }
  return waarde;
}

/** Tijdstip waarop de gecachete waarde voor een sleutel is berekend (null = niet in cache). */
export function bijgewerktOp(key: string): Date | null {
  const e = store.get(key);
  return e ? new Date(e.bijgewerkt) : null;
}
