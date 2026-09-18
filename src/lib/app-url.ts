/**
 * Eén bron van waarheid voor de publieke basis-URL (metadata, sitemap, robots,
 * e-maillinks). Volgorde:
 * 1. APP_URL (expliciet ingesteld; hoort in productie het definitieve domein te zijn)
 * 2. Vercel-productiedomein (VERCEL_PROJECT_PRODUCTION_URL)
 * 3. Vercel-deploy-URL (VERCEL_URL) — zodat previews nooit naar een verkeerd
 *    of verouderd domein verwijzen
 * 4. localhost
 * Een ontbrekend schema wordt aangevuld; een ongeldige waarde kan de build
 * nooit laten crashen.
 */
export function resolveAppUrl(): string {
  const fallback = "http://localhost:3000";
  const kandidaten = [
    process.env.APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];
  for (const raw of kandidaten) {
    const v = raw?.trim();
    if (!v) continue;
    const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try {
      return new URL(withScheme).origin;
    } catch {
      continue;
    }
  }
  return fallback;
}
